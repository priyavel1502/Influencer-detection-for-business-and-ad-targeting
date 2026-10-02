// =========================
// API URL
// =========================

const API_URL = "http://127.0.0.1:8000";

// =========================
// AUTH
// =========================

function getCurrentUser() {

    const user =
        localStorage.getItem(
            "currentUser"
        );

    return user
        ? JSON.parse(user)
        : null;
}

function setCurrentUser(user) {

    if (user) {

        localStorage.setItem(
            "currentUser",
            JSON.stringify(user)
        );

    } else {

        localStorage.removeItem(
            "currentUser"
        );
    }
}

function logout() {

    localStorage.clear();

    window.location.href =
        "login.html";
}

// =========================
// ALERT
// =========================

function showAlert(
    message,
    type = "success"
) {

    alert(message);
}

// =========================
// FORMATTERS
// =========================

const formatNum = (num) =>

    new Intl.NumberFormat(
        "en-IN",
        {
            notation: "compact",
            compactDisplay: "short"
        }
    ).format(num);

const formatCurrency = (num) =>

    "₹ " +

    new Intl.NumberFormat(
        "en-IN",
        {
            maximumFractionDigits: 0
        }
    ).format(num);

// =========================
// PAGE INIT
// =========================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        if (
            window.location.pathname
            .includes("dashboard.html")
        ) {

            initDashboard();
        }

        else if (
            window.location.pathname
            .includes("results.html")
        ) {

            initResults();
        }

        else if (
            window.location.pathname
            .includes("analytics.html")
        ) {

            initAnalytics();
        }
    }
);

// =========================
// LOGIN
// =========================

async function login() {

    const email =
        document.getElementById(
            "login-email"
        ).value;

    const password =
        document.getElementById(
            "login-password"
        ).value;

    try {

        const response =
            await fetch(

                `${API_URL}/login`,

                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                        "application/json"
                    },

                    body: JSON.stringify({

                        email,
                        password

                    })
                }
            );

        const data =
            await response.json();

        if (response.ok) {

            setCurrentUser(data);

            window.location.href =
                "dashboard.html";

        } else {

            showAlert(
                data.detail,
                "error"
            );
        }

    } catch (err) {

        console.error(err);
    }
}

// =========================
// SIGNUP
// =========================

async function signup() {

    const name =
        document.getElementById(
            "signup-name"
        ).value;

    const email =
        document.getElementById(
            "signup-email"
        ).value;

    const password =
        document.getElementById(
            "signup-password"
        ).value;

    try {

        const response =
            await fetch(

                `${API_URL}/signup`,

                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                        "application/json"
                    },

                    body: JSON.stringify({

                        name,
                        email,
                        password

                    })
                }
            );

        const data =
            await response.json();

        if (response.ok) {

            window.location.href =
                "login.html";

        } else {

            showAlert(
                data.detail,
                "error"
            );
        }

    } catch (err) {

        console.error(err);
    }
}

// =========================
// DASHBOARD
// =========================

function initDashboard() {

    loadYoutubeInfluencers();
}

// =========================
// FETCH RESULTS
// =========================

function fetchInfluencers() {

    const category =
        document.getElementById(
            "campaign-category"
        ).value;

    const budget =
        parseInt(

            document.getElementById(
                "campaign-budget"
            ).value || 0
        );

    window.location.href =

        `results.html?category=${category}&budget=${budget}`;
}

// =========================
// RESULTS INIT
// =========================

function initResults() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const category =
        params.get("category")
        || "All";

    const budget =
        parseInt(
            params.get("budget")
            || "0"
        );

    fetchResultsAnalytics(
        category,
        budget
    );
}

// =========================
// FETCH ANALYTICS
// =========================

async function fetchResultsAnalytics(
    category,
    budget
) {

    try {

        const response =
            await fetch(

                `${API_URL}/top-influencers?category=${category}&budget=${budget}`

            );

        const data =
            await response.json();

        const topInfluencers =
            data.selected_influencers || [];

        const remainingInfluencers =
            data.remaining_influencers || [];

        localStorage.setItem(

            "currentCampaignData",

            JSON.stringify(
                topInfluencers
            )
        );

        // =========================
        // UPDATE STATS
        // =========================

        document.getElementById(
            "stat-afford-count"
        ).innerText =

            topInfluencers.length +
            remainingInfluencers.length;

        document.getElementById(
            "stat-total-cost"
        ).innerText =

            formatCurrency(
                data.total_cost || 0
            );

        document.getElementById(
            "stat-remaining-budget"
        ).innerText =

            formatCurrency(

                budget -
                (data.total_cost || 0)
            );

        const utilization =

            budget > 0

            ?

            (
                (
                    data.total_cost || 0
                )

                /

                budget

            ) * 100

            :

            0;

        document.getElementById(
            "stat-budget-utilization"
        ).innerText =

            utilization.toFixed(1)
            + "%";

        document.getElementById(
            "utilization-bar"
        ).style.width =

            utilization.toFixed(1)
            + "%";

        // =========================
        // RENDER
        // =========================

        renderTopInfluencers(
            topInfluencers
        );

        renderRemainingTable(
            remainingInfluencers
        );

        if (
            remainingInfluencers.length > 0
        ) {

            document.getElementById(
                "remaining-influencers-section"
            ).classList.remove(
                "hidden"
            );
        }

    } catch (err) {

        console.error(err);
    }
}

// =========================
// TOP INFLUENCERS
// =========================

function renderTopInfluencers(
    influencers
) {

    const grid =
        document.getElementById(
            "top-influencer-list"
        );

    grid.innerHTML = "";

    influencers.forEach((inf) => {

        grid.innerHTML += `

        <div class="glass-card influencer-card">

            <h3>${inf.name}</h3>

            <p>${inf.username}</p>

            <span class="badge platform">
                ${inf.platform}
            </span>

            <div class="card-stats">

                <div class="stat-box">

                    <small>Followers</small>

                    <strong>
                        ${formatNum(
                            inf.followers
                        )}
                    </strong>

                </div>

                <div class="stat-box">

                    <small>Engagement</small>

                    <strong>
                        ${inf.engagement.toFixed(1)}%
                    </strong>

                </div>

            </div>

            <p class="cost-display">

                Est. Cost:

                <strong>
                    ${formatCurrency(
                        inf.actual_cost
                    )}
                </strong>

            </p>

        </div>
        `;
    });
}

// =========================
// REMAINING TABLE
// =========================

function renderRemainingTable(
    influencers
) {

    const tbody =
        document.querySelector(
            "#remaining-table tbody"
        );

    if (!tbody) return;

    tbody.innerHTML = "";

    influencers.forEach((inf) => {

        tbody.innerHTML += `

        <tr>

            <td>${inf.name}</td>

            <td>${inf.category}</td>

            <td>
                ${formatNum(
                    inf.followers
                )}
            </td>

            <td>
                ${inf.engagement.toFixed(1)}%
            </td>

            <td>
                ${formatCurrency(
                    inf.actual_cost
                )}
            </td>

            <td>${inf.status}</td>

            <td>

                <button
                    class="btn-secondary"
                >
                    Contact
                </button>

            </td>

        </tr>
        `;
    });
}

// =========================
// ANALYTICS INIT
// =========================

function initAnalytics() {

    const dataStr =
        localStorage.getItem(
            "currentCampaignData"
        );

    if (!dataStr) return;

    const influencers =
        JSON.parse(dataStr);

    if (
        !influencers
        ||
        influencers.length === 0
    ) return;

    // =========================
    // STATS
    // =========================

    const totalInfluencers =
        influencers.length;

    const avgEngagement = (

        influencers.reduce(
            (sum, inf) =>
                sum + inf.engagement,
            0
        )

        /

        totalInfluencers

    ).toFixed(1);

    const totalCost =
        influencers.reduce(
            (sum, inf) =>
                sum + inf.actual_cost,
            0
        );

    const bestInfluencer =
        influencers.reduce(
            (best, current) => {

                const currentROI =
                    current.engagement
                    /
                    current.actual_cost;

                const bestROI =
                    best.engagement
                    /
                    best.actual_cost;

                return (
                    currentROI > bestROI
                )
                    ? current
                    : best;
            }
        );

    document.getElementById(
        "analytics-total"
    ).innerText =
        totalInfluencers;

    document.getElementById(
        "analytics-engagement"
    ).innerText =
        avgEngagement + "%";

    document.getElementById(
        "analytics-cost"
    ).innerText =
        formatCurrency(totalCost);

    document.getElementById(
        "analytics-best"
    ).innerText =
        bestInfluencer.name;

    renderROIAnalysis(
        influencers
    );

    renderAdvancedCharts(
        influencers
    );
}

// =========================
// ROI TABLE
// =========================

function renderROIAnalysis(
    influencers
) {

    const tbody =
        document.querySelector(
            "#roi-table tbody"
        );

    tbody.innerHTML = "";

    influencers.forEach((inf) => {

        tbody.innerHTML += `

        <tr>

            <td>${inf.name}</td>

            <td>
                ${formatNum(
                    inf.followers
                )}
            </td>

            <td>
                ${inf.engagement.toFixed(1)}%
            </td>

            <td>
                ${formatCurrency(
                    inf.predicted_cost
                )}
            </td>

            <td>
                ${formatCurrency(
                    inf.actual_cost
                )}
            </td>

            <td>${inf.status}</td>

        </tr>
        `;
    });
}

// =========================
// CHARTS
// =========================

let pieChartInstance = null;
let barChartInstance = null;
let lineChartInstance = null;

function renderAdvancedCharts(influencers) {

    const labels =
        influencers.map(
            i => i.name
        );

    const engagements =
        influencers.map(
            i => i.engagement
        );

    const costs =
        influencers.map(
            i => i.actual_cost
        );

    // =========================
    // PIE CHART
    // =========================

    const ctxPie =
        document.getElementById(
            "pieChart"
        );

    if (ctxPie) {

        ctxPie.parentElement.style.height =
            "420px";

        ctxPie.parentElement.style.position =
            "relative";

        ctxPie.parentElement.style.padding =
            "20px";

        if (pieChartInstance) {
            pieChartInstance.destroy();
        }

        pieChartInstance =
            new Chart(ctxPie, {

                type: "pie",

                data: {

                    labels: labels,

                    datasets: [{

                        data:
                            influencers.map(
                                i => i.followers
                            ),

                        backgroundColor: [

                            "#6366f1",
                            "#8b5cf6",
                            "#ec4899",
                            "#14b8a6",
                            "#f59e0b"

                        ],

                        borderWidth: 2,
                        borderColor: "#fff",

                        radius: "70%"
                    }]
                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    layout: {

                        padding: {
                            top: 10,
                            bottom: 10,
                            left: 10,
                            right: 10
                        }
                    },

                    plugins: {

                        legend: {

                            position: "top",

                            align: "center",

                            labels: {

                                boxWidth: 14,

                                padding: 12,

                                font: {
                                    size: 11
                                }
                            }
                        }
                    }
                }
            });
    }

    // =========================
    // BAR CHART
    // =========================

    const ctxBar =
        document.getElementById(
            "roiChart"
        );

    if (ctxBar) {

        ctxBar.parentElement.style.height =
            "420px";

        if (barChartInstance) {
            barChartInstance.destroy();
        }

        barChartInstance =
            new Chart(ctxBar, {

                type: "bar",

                data: {

                    labels: labels,

                    datasets: [{

                        label:
                            "Engagement Rate",

                        data:
                            engagements,

                        backgroundColor:
                            "#818cf8",

                        borderRadius: 8
                    }]
                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {

                            position: "top"
                        }
                    },

                    scales: {

                        y: {

                            beginAtZero: true,

                            ticks: {

                                callback:
                                    value =>
                                    value + "%"
                            }
                        }
                    }
                }
            });
    }

    // =========================
    // LINE CHART
    // =========================

    const ctxLine =
        document.getElementById(
            "lineChart"
        );

    if (ctxLine) {

        ctxLine.parentElement.style.height =
            "420px";

        if (lineChartInstance) {
            lineChartInstance.destroy();
        }

        lineChartInstance =
            new Chart(ctxLine, {

                type: "line",

                data: {

                    labels: labels,

                    datasets: [{

                        label:
                            "Campaign Cost",

                        data: costs,

                        borderColor:
                            "#f59e0b",

                        backgroundColor:
                            "rgba(245,158,11,0.2)",

                        fill: true,

                        tension: 0.4,

                        pointRadius: 5
                    }]
                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {

                            position: "top"
                        }
                    },

                    scales: {

                        y: {

                            beginAtZero: true,

                            ticks: {

                                callback:
                                    value =>
                                    "₹" + value
                            }
                        }
                    }
                }
            });
    }
}

// =========================
// REALTIME YOUTUBE
// =========================

async function loadYoutubeInfluencers() {

    const container =
        document.getElementById(
            "youtubeInfluencers"
        );

    if (!container) return;

    try {

        const response =
            await fetch(

                `${API_URL}/youtube-live`

            );

        const data =
            await response.json();

        container.innerHTML = "";

        data.results.forEach((item) => {

            container.innerHTML += `

            <div class="glass-card influencer-card">

                <h3>
                    ${item.channel}
                </h3>

                <p>
                    Subscribers:
                    ${formatNum(
                        item.subscribers
                    )}
                </p>

                <p>
                    Views:
                    ${formatNum(
                        item.views
                    )}
                </p>

                <p>
                    Status:
                    ${item.status}
                </p>

            </div>
            `;
        });

    } catch (err) {

        console.error(err);
    }
}

setInterval(() => {

    loadYoutubeInfluencers();

}, 10000);