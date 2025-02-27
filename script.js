const body = document.body;
const particlesDiv = document.createElement("div");
particlesDiv.id = "particles-js";
body.appendChild(particlesDiv);

const style = document.createElement("style");
style.textContent = `
    body { margin: 0; overflow: hidden; }
    #particles-js { 
        position: fixed; 
        width: 100%; 
        height: 100%; 
        background: transparent; 
        z-index: -1; 
    }
    
    .prediction-box {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        padding: 20px;
        background-color: rgba(0, 0, 0, 0.7);
        color: white;
        font-size: 24px;
        border-radius: 10px;
        z-index: 10; 
    }
    
    #history-list {
        margin-top: 50px;
        z-index: 10;
    }
`;
document.head.appendChild(style);

const script = document.createElement("script");
script.src = "https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js";
script.onload = () => {
    particlesJS("particles-js", {
        particles: {
            number: { value: 200 },
            color: { value: "#ffffff" },
            size: { value: 5, random: true },
            line_linked: { enable: true, distance: 150, color: "#ffffff", opacity: 0.4, width: 1 },
            move: { enable: true, speed: 0.5 }
        },
        interactivity: {
            detect_on: "canvas",
            events: {
                onhover: { enable: false },
                onclick: { enable: false },
                resize: true
            }
        }
    });
};
document.head.appendChild(script);

let previousResults = [];

async function fetchCurrentGameIssue() {
    const apiUrl = 'https://api.bdg88zf.com/api/webapi/GetGameIssue';
    const requestData = {
        typeId: 1,
        language: 0,
        random: "40079dcba93a48769c6ee9d4d4fae23f",
        signature: "D12108C4F57C549D82B23A91E0FA20AE",
        timestamp: 1727792520,
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json;charset=UTF-8' },
            body: JSON.stringify(requestData),
        });

        if (response.ok) {
            const data = await response.json();
            if (data.code === 0) {
                updateTimer(data.data);
                generatePrediction(data.data);
            }
        }
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

function updateTimer(data) {
    const periodNumber = document.getElementById('period-number');
    periodNumber.textContent = data.issueNumber;

    const endTime = new Date(data.endTime).getTime();
    const interval = setInterval(() => {
        const now = new Date().getTime();
        const distance = endTime - now;

        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById('minutes').textContent = minutes < 10 ? '0' + minutes : minutes;
        document.getElementById('seconds').textContent = seconds < 10 ? '0' + seconds : seconds;

        if (distance < 0) {
            clearInterval(interval);
            document.getElementById('minutes').textContent = "00";
            document.getElementById('seconds').textContent = "00";

            fetchCurrentGameIssue();
            fetchPreviousResults();
        }
    }, 1000);
}

function generatePrediction(data) {
    if (previousResults.length === 0) {
        document.getElementById('prediction').textContent = "Loading...";
        return;
    }

    const prediction = Math.random() < 0.5 ? "BIG" : "SMALL";  
    document.getElementById('prediction').textContent = `PREDICTION(PLAY ONLY 10 WINS): ${prediction}`;
}

async function fetchPreviousResults() {
    const apiUrl = 'https://api.bdg88zf.com/api/webapi/GetNoaverageEmerdList';
    const requestData = {
        pageSize: 10,
        pageNo: 1,
        typeId: 1,
        language: 0,
        random: "c2505d9138da4e3780b2c2b34f2fb789",
        signature: "7D637E060DA35C0C6E28DC6D23D71BED",
        timestamp: 1727792520,
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json;charset=UTF-8' },
            body: JSON.stringify(requestData),
        });

        if (response.ok) {
            const data = await response.json();
            if (data.code === 0) {
                previousResults = data.data.list;
                updatePreviousResults(previousResults);
            }
        }
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

function updatePreviousResults(resultList) {
    const historyTable = document.getElementById('history-list').querySelector('tbody');
    historyTable.innerHTML = '';

    resultList.forEach((result) => {
        const { issueNumber, number, colour } = result;
        const size = number <= 4 ? 'SMALL' : 'BIG';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${issueNumber}</td>
            <td>${number}</td>
            <td>${size}</td>
            <td>${colour.toUpperCase()}</td>
        `;

        historyTable.appendChild(row);
    });
}

const predictionBox = document.createElement("div");
predictionBox.classList.add("prediction-box");
predictionBox.id = "prediction";
document.body.appendChild(predictionBox);

fetchCurrentGameIssue();
fetchPreviousResults();o
