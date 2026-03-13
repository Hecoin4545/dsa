const axios = require('axios');
const User = require('../models/User');

const cheerio = require('cheerio');

// ─── LeetCode ────────────────────────────────────────────────
// Uses the alfa-leetcode-api (REST wrapper) for reliability, with
// a fallback to the raw LeetCode GraphQL endpoint.
async function fetchLeetcodeStats(handle) {
    if (!handle) return null;

    // Strategy 1: Use alfa-leetcode-api REST wrapper (most reliable)
    try {
        const [solvedResp, contestResp] = await Promise.all([
            axios.get(`https://alfa-leetcode-api.onrender.com/${handle}/solved`, { timeout: 15000 }),
            axios.get(`https://alfa-leetcode-api.onrender.com/${handle}/contest`, { timeout: 15000 }),
        ]);

        const solved = solvedResp.data;
        const contest = contestResp.data;

        // Ensure we got an actual user object and not an error disguised as 200 OK
        if (solved && solved.errors) throw new Error(solved.errors[0]?.message);

        // Count monthly solved from contest participation (approximate)
        // The REST API doesn't give monthly problem-solving data directly,
        // so we'll use the GraphQL recentAcSubmissionList as a secondary source
        let monthlySolved = 0;
        try {
            const recentQuery = `{
        recentAcSubmissionList(username: "${handle}", limit: 200) {
          timestamp
        }
      }`;
            const recentResp = await axios.post('https://leetcode.com/graphql', { query: recentQuery }, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 10000,
            });
            const recentAc = recentResp.data?.data?.recentAcSubmissionList || [];
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            monthlySolved = recentAc.filter(sub => {
                const subDate = new Date(parseInt(sub.timestamp) * 1000);
                return subDate >= startOfMonth;
            }).length;
        } catch {
            monthlySolved = 0;
        }

        return {
            totalSolved: solved?.solvedProblem || 0,
            monthlySolved,
            easySolved: solved?.easySolved || 0,
            mediumSolved: solved?.mediumSolved || 0,
            hardSolved: solved?.hardSolved || 0,
            rating: contest?.contestRating ? Math.round(contest.contestRating) : 0,
            globalRanking: contest?.contestGlobalRanking || 0,
            contestsAttended: contest?.contestAttend || 0,
        };
    } catch (err) {
        console.warn(`LeetCode REST API failed for ${handle}: ${err.message}`);
    }

    // Strategy 2: Direct GraphQL fallback
    try {
        const query = `{
      matchedUser(username: "${handle}") {
        submitStatsGlobal {
          acSubmissionNum { difficulty count }
        }
      }
      userContestRanking(username: "${handle}") {
        attendedContestsCount
        rating
        globalRanking
      }
    }`;
        const resp = await axios.post('https://leetcode.com/graphql', { query }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 12000,
        });
        const matched = resp.data?.data?.matchedUser;
        const contestData = resp.data?.data?.userContestRanking;
        if (!matched) return null;
        const ac = matched.submitStatsGlobal?.acSubmissionNum || [];
        const find = (d) => ac.find(s => s.difficulty === d)?.count || 0;

        return {
            totalSolved: find('All'),
            monthlySolved: 0,
            easySolved: find('Easy'),
            mediumSolved: find('Medium'),
            hardSolved: find('Hard'),
            rating: contestData?.rating ? Math.round(contestData.rating) : 0,
            globalRanking: contestData?.globalRanking || 0,
            contestsAttended: contestData?.attendedContestsCount || 0,
        };
    } catch (err) {
        console.error(`LeetCode GraphQL also failed for ${handle}:`, err.message);
        return null;
    }
}

// ─── Codeforces ──────────────────────────────────────────────
async function fetchCodeforcesStats(handle) {
    if (!handle) return null;
    try {
        const [infoResp, statusResp] = await Promise.all([
            axios.get(`https://codeforces.com/api/user.info?handles=${handle}`, { timeout: 10000 }),
            axios.get(`https://codeforces.com/api/user.status?handle=${handle}&from=1&count=10000`, { timeout: 15000 }),
        ]);
        const user = infoResp.data?.result?.[0];
        const submissions = statusResp.data?.result || [];

        const acceptedProblems = new Set();
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        let monthlySolved = 0;

        submissions.forEach(sub => {
            if (sub.verdict === 'OK') {
                const problemId = `${sub.problem.contestId}-${sub.problem.index}`;
                if (!acceptedProblems.has(problemId)) {
                    acceptedProblems.add(problemId);
                    const subDate = new Date(sub.creationTimeSeconds * 1000);
                    if (subDate >= startOfMonth) {
                        monthlySolved++;
                    }
                }
            }
        });

        return {
            totalSolved: acceptedProblems.size,
            monthlySolved,
            rating: user?.rating || 0,
            maxRating: user?.maxRating || 0,
            rank: user?.rank || 'unrated',
        };
    } catch (err) {
        console.error(`Codeforces fetch error for ${handle}:`, err.message);
        return null;
    }
}

// ─── CodeChef (Direct Scraping) ──────────────────────────────
// The third-party CodeChef APIs are unreliable/paywalled.
// We scrape the public profile page directly using Cheerio.
async function fetchCodechefStats(handle) {
    if (!handle) return null;
    try {
        const resp = await axios.get(`https://www.codechef.com/users/${handle}`, {
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml',
            },
        });

        const html = resp.data;
        const $ = cheerio.load(html);

        let rating = 0;
        let stars = '0';
        let totalSolved = 0;

        // Parse CodeChef Next.js hydration data JSON
        // Codechef puts user data in a global __NEXT_DATA__ script tag or similar
        const nextDataScript = $('#__NEXT_DATA__').html();
        if (nextDataScript) {
            try {
                const data = JSON.parse(nextDataScript);
                const user = data?.props?.pageProps?.user;
                if (user) {
                    rating = parseInt(user.rating) || 0;
                    stars = user.stars || '1';
                }
            } catch (e) {
                // ignore
            }
        }

        // Fallback for rating: Look at the rating-number div
        if (rating === 0) {
            const ratingText = $('.rating-number').text().trim() ||
                $('.rating-header .rating-number').text().trim() ||
                $('a[href^="/ratings/all"]').first().text().trim();
            const rMatch = ratingText.match(/(\d+)/);
            if (rMatch) rating = parseInt(rMatch[1]);
        }

        // Fallback for total solved
        const headingText = $('h3:contains("Total Problems Solved")').text();
        const solvedMatch = headingText.match(/(\d+)/);
        if (solvedMatch) {
            totalSolved = parseInt(solvedMatch[1]);
        }

        // Fallback for total solved: Find the 'Total Problems Solved' text across all elements
        if (totalSolved === 0) {
            const rawTextMatch = html.match(/Total\s*Problems\s*Solved\s*:\s*(\d+)/i);
            if (rawTextMatch) totalSolved = parseInt(rawTextMatch[1]);
        }

        // Fallback for stars
        if (stars === '0') {
            const starText = $('.rating-star').text().trim() ||
                $('span:contains("★")').first().text().trim();
            const sMatch = starText.match(/(\d+)★/);
            if (sMatch) stars = sMatch[1];
        }

        console.log(`CodeChef scraped by Cheerio for ${handle}: rating=${rating}, stars=${stars}, totalSolved=${totalSolved}`);

        // Only count it as success if we extracted at least *something*
        if (rating === 0 && totalSolved === 0) {
            throw new Error('Profile layout changed or user not found');
        }

        return {
            totalSolved,
            monthlySolved: 0,
            rating,
            stars,
        };
    } catch (err) {
        console.error(`CodeChef Cheerio scrape error for ${handle}:`, err.message);
        return null; // Return null instead of default 0s to trigger 'failed' result for User
    }
}


// ─── Get Rankings ────────────────────────────────────────────
exports.getRankings = async (req, res) => {
    try {
        const { platform } = req.params;
        const { sortBy } = req.query;
        const validPlatforms = ['leetcode', 'codeforces', 'codechef'];

        if (!validPlatforms.includes(platform)) {
            return res.status(400).json({ error: 'Invalid platform. Use leetcode, codeforces, or codechef.' });
        }

        const sortField = ['totalSolved', 'monthlySolved', 'rating'].includes(sortBy)
            ? sortBy
            : 'totalSolved';

        const users = await User.find({
            isVerified: true,
            [`handles.${platform}`]: { $ne: '' },
        }).select(`name email handles.${platform} stats.${platform} isVerified`);

        const sorted = users.sort((a, b) => {
            const aVal = a.stats?.[platform]?.[sortField] || 0;
            const bVal = b.stats?.[platform]?.[sortField] || 0;
            return bVal - aVal;
        });

        res.json(sorted);
    } catch (err) {
        console.error('Get rankings error:', err);
        res.status(500).json({ error: 'Server error.' });
    }
};

// ─── Refresh Stats ───────────────────────────────────────────
exports.refreshMyStats = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ error: 'User not found.' });

        const results = {};

        const [lcStats, cfStats, ccStats] = await Promise.allSettled([
            fetchLeetcodeStats(user.handles?.leetcode),
            fetchCodeforcesStats(user.handles?.codeforces),
            fetchCodechefStats(user.handles?.codechef),
        ]);

        if (lcStats.status === 'fulfilled' && lcStats.value) {
            user.stats.leetcode = { ...user.stats.leetcode?.toObject?.() || {}, ...lcStats.value };
            results.leetcode = 'success';
        } else {
            results.leetcode = 'failed';
        }

        if (cfStats.status === 'fulfilled' && cfStats.value) {
            user.stats.codeforces = { ...user.stats.codeforces?.toObject?.() || {}, ...cfStats.value };
            results.codeforces = 'success';
        } else {
            results.codeforces = 'failed';
        }

        if (ccStats.status === 'fulfilled' && ccStats.value) {
            user.stats.codechef = { ...user.stats.codechef?.toObject?.() || {}, ...ccStats.value };
            results.codechef = 'success';
        } else {
            results.codechef = 'failed';
        }

        user.lastStatsUpdate = new Date();
        await user.save();

        res.json({
            message: 'Stats refresh complete.',
            results,
            stats: user.stats,
        });
    } catch (err) {
        console.error('Refresh stats error:', err);
        res.status(500).json({ error: 'Failed to refresh stats.' });
    }
};
