// =========================
// Helper Functions
// =========================

function hideAll() {
    document
        .querySelectorAll('#content-area > div')
        .forEach(div => div.classList.add('hidden'));
}

function removeActive() {
    document
        .querySelectorAll('.menu li')
        .forEach(li => li.classList.remove('active'));
}

function showPage(pageId, buttonId) {

    hideAll();
    removeActive();

    document
        .getElementById(pageId)
        ?.classList.remove('hidden');

    document
        .getElementById(buttonId)
        ?.classList.add('active');
}


// =========================
// Sidebar Navigation
// =========================

document.getElementById('dashboard-btn')
?.addEventListener('click', () => {
    showPage('dashboard-page', 'dashboard-btn');
});

document.getElementById('chat-btn')
?.addEventListener('click', () => {
    showPage('chat-page', 'chat-btn');
});

document.getElementById('notes-btn')
?.addEventListener('click', () => {
    showPage('notes-page', 'notes-btn');
});

document.getElementById('upload-btn')
?.addEventListener('click', () => {
    showPage('upload-page', 'upload-btn');
});

document.getElementById('quiz-btn')
?.addEventListener('click', () => {
    showPage('quiz-page', 'quiz-btn');
});

document.getElementById('progress-btn')
?.addEventListener('click', () => {
    showPage('progress-page', 'progress-btn');
});

document.getElementById('voice-btn')
?.addEventListener('click', () => {
    showPage('voice-page', 'voice-btn');
});

document.getElementById('cloud-btn')
?.addEventListener('click', () => {
    showPage('cloud-page', 'cloud-btn');
});

document.getElementById('settings-btn')
?.addEventListener('click', () => {
    showPage('settings-page', 'settings-btn');
});


// =========================
// AI Professor Chat
// =========================

const sendBtn =
    document.getElementById('send-btn');

const userInput =
    document.getElementById('user-input');

const chatBody =
    document.getElementById('chat-body');

async function sendMessage() {

    const message =
        userInput?.value.trim();

    if (!message) return;

    // User Message
    const userDiv =
        document.createElement('div');

    userDiv.className =
        'user-message';

    userDiv.innerText =
        message;

    chatBody.appendChild(userDiv);

    userInput.value = '';

    // AI Placeholder
    const aiDiv =
        document.createElement('div');

    aiDiv.className =
        'ai-message';

    aiDiv.innerText =
        'Thinking...';

    chatBody.appendChild(aiDiv);

    chatBody.scrollTop =
        chatBody.scrollHeight;

    try {

        const response =
            await fetch(
                'http://127.0.0.1:5000/chat',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type':
                            'application/json'
                    },
                    body: JSON.stringify({
                        message: message
                    })
                }
            );

        const data =
            await response.json();

        aiDiv.innerText =
            data.reply;

    }
    catch(error){

        aiDiv.innerText =
            'Unable to connect to AI Professor.';

        console.error(error);
    }

    chatBody.scrollTop =
        chatBody.scrollHeight;
}


// Send Button
sendBtn?.addEventListener(
    'click',
    sendMessage
);


// Enter Key
userInput?.addEventListener(
    'keypress',
    function(e){

        if(e.key === 'Enter'){
            sendMessage();
        }
    }
);
const notesBtn =
    document.getElementById('generate-notes');

notesBtn?.addEventListener(
    'click',
    async ()=>{

        const topic =
            document.getElementById('notes-topic').value;

        const level =
            document.getElementById('notes-level').value;

        const length =
            document.getElementById('notes-length').value;

        const output =
            document.getElementById('notes-output');

        output.innerHTML =
            'Generating notes...';

        const response =
            await fetch(
                'http://127.0.0.1:5000/notes',
                {
                    method:'POST',
                    headers:{
                        'Content-Type':
                            'application/json'
                    },
                    body:JSON.stringify({
                        topic,
                        level,
                        length
                    })
                }
            );

        const data =
            await response.json();

        output.innerHTML =
            data.notes;
    }
);
const quizBtn =
    document.getElementById('generate-quiz');

quizBtn?.addEventListener(
    'click',
    async ()=>{

        const topic =
            document.getElementById('quiz-topic').value;

        const level =
            document.getElementById('quiz-level').value;

        const count =
            document.getElementById('quiz-count').value;

        const output =
            document.getElementById('quiz-output');

        output.innerHTML =
            'Generating quiz...';

        const response =
            await fetch(
                'http://127.0.0.1:5000/quiz',
                {
                    method:'POST',
                    headers:{
                        'Content-Type':
                            'application/json'
                    },
                    body:JSON.stringify({
                        topic,
                        level,
                        count
                    })
                }
            );

        const data =
            await response.json();

        output.innerHTML =
            data.quiz;
    }
);
document
.getElementById('upload-pdf')
?.addEventListener(
'click',
async ()=>{

    const file =
        document
        .getElementById('pdf-file')
        .files[0];

    const form =
        new FormData();

    form.append(
        'file',
        file
    );

    const response =
        await fetch(
            'http://127.0.0.1:5000/upload_pdf',
            {
                method:'POST',
                body:form
            }
        );

    const data =
        await response.json();

    document
    .getElementById('pdf-output')
    .innerHTML =
        data.message;
});


document
.getElementById('ask-pdf')
?.addEventListener(
'click',
async ()=>{

    const question =
        document
        .getElementById('pdf-question')
        .value;

    const response =
        await fetch(
            'http://127.0.0.1:5000/ask_pdf',
            {
                method:'POST',
                headers:{
                    'Content-Type':
                        'application/json'
                },
                body:JSON.stringify({
                    question
                })
            }
        );

    const data =
        await response.json();

    document
    .getElementById('pdf-output')
    .innerHTML =
        data.answer;
});
const voiceBtn =
    document.getElementById('start-voice');

voiceBtn?.addEventListener(
'click',
()=>{

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    const recognition =
        new SpeechRecognition();

    recognition.lang = 'en-US';

    recognition.start();

    recognition.onresult =
        async function(event){

        const text =
            event.results[0][0].transcript;

        document
        .getElementById('voice-text')
        .innerHTML =
            text;

        const response =
            await fetch(
                'http://127.0.0.1:5000/chat',
                {
                    method:'POST',
                    headers:{
                        'Content-Type':
                            'application/json'
                    },
                    body:JSON.stringify({
                        message:text
                    })
                }
            );

        const data =
            await response.json();

        document
        .getElementById('voice-answer')
        .innerHTML =
            data.reply;

        const speech =
            new SpeechSynthesisUtterance(
                data.reply
            );

        speechSynthesis
            .speak(speech);
    };
});
document
.getElementById('download-notes')
?.addEventListener(
'click',
()=>{

    window.open(
        'http://127.0.0.1:5000/download_notes',
        '_blank'
    );

});
// Quick Chat
document
.getElementById('quick-chat')
?.addEventListener(
'click',
()=>{

    hideAll();
    removeActive();

    document
    .getElementById('chat-page')
    .classList.remove('hidden');

    document
    .getElementById('chat-btn')
    .classList.add('active');
});


// Quick Notes
document
.getElementById('quick-notes')
?.addEventListener(
'click',
()=>{

    hideAll();
    removeActive();

    document
    .getElementById('notes-page')
    .classList.remove('hidden');

    document
    .getElementById('notes-btn')
    .classList.add('active');
});


// Quick Quiz
document
.getElementById('quick-quiz')
?.addEventListener(
'click',
()=>{

    hideAll();
    removeActive();

    document
    .getElementById('quiz-page')
    .classList.remove('hidden');

    document
    .getElementById('quiz-btn')
    .classList.add('active');
});


// Quick Upload
document
.getElementById('quick-upload')
?.addEventListener(
'click',
()=>{

    hideAll();
    removeActive();

    document
    .getElementById('upload-page')
    .classList.remove('hidden');

    document
    .getElementById('upload-btn')
    .classList.add('active');
});
async function updateDashboard(){

    try{

        const response =
            await fetch(
                'http://127.0.0.1:5000/progress'
            );

        const data =
            await response.json();

        document
            .getElementById(
                'dashboard-chat'
            ).innerHTML =
            data.chat;

        document
            .getElementById(
                'dashboard-notes'
            ).innerHTML =
            data.notes;

        document
            .getElementById(
                'dashboard-quiz'
            ).innerHTML =
            data.quiz;

        document
            .getElementById(
                'dashboard-pdf'
            ).innerHTML =
            data.pdf;

    }
    catch(err){

        console.log(err);

    }
}
updateDashboard();
setInterval(
    updateDashboard,
    2000
);
async function updateActivities(){

    const response =
        await fetch(
            'http://127.0.0.1:5000/activities'
        );

    const data =
        await response.json();

    const container =
        document.getElementById(
            'activity-list'
        );

    container.innerHTML = '';

    data.activities.forEach(
    item => {

        container.innerHTML += `
            <div class="activity">

                <span>
                    ${item.activity}
                </span>

                <small>
                    ${item.time}
                </small>

            </div>
        `;
    }
);
}
updateActivities();

setInterval(
    updateActivities,
    2000
);