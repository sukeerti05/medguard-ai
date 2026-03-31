import React, { useEffect } from "react";
import "../index.css";
import emailjs from "emailjs-com";

function Home() {

useEffect(() => {

  /* Typing Animation */

  let text = "MedGuard AI";
  let i = 0;

  function typing(){
    if(i < text.length){
      const el = document.getElementById("typing");
      if(el){
        el.innerHTML += text.charAt(i);
        i++;
        setTimeout(typing,120);
      }
    }
  }

  typing();


  /* Scroll Animation */

  const observer = new IntersectionObserver((entries)=>{
    entries.forEach((entry)=>{
      if(entry.isIntersecting){
        entry.target.classList.add("show");
      }
    });
  });

  const hiddenElements = document.querySelectorAll(".hidden");
  hiddenElements.forEach((el)=>observer.observe(el));


  /* AI Health Tips */

  const tips=[
  "Drink at least 8 glasses of water daily.",
  "Never skip prescribed medications.",
  "Maintain a regular sleep schedule.",
  "Regular health checkups prevent serious diseases.",
  "Exercise at least 30 minutes daily."
  ];

  const randomTip=tips[Math.floor(Math.random()*tips.length)];

  const tipElement = document.getElementById("tip");
  if(tipElement){
    tipElement.innerText=randomTip;
  }

},[]);



/* EMAIL FUNCTION */

const sendEmail = (e) => {

e.preventDefault();

emailjs.sendForm(
"service_medguard",     // replace
"template_contact",     // replace
e.target,
"YOUR_PUBLIC_KEY"       // replace
)
.then(()=>{
alert("Message Sent Successfully!");
})
.catch(()=>{
alert("Failed to send message");
});

e.target.reset();

};



return (

<div className="home-page">


{/* Floating Medical Icons */}

<div className="floating-icons">
<span>💊</span>
<span>🩺</span>
<span>❤️</span>
<span>💉</span>
<span>🏥</span>
</div>


{/* Background Blobs */}

<div className="blob blob1"></div>
<div className="blob blob2"></div>
<div className="blob blob3"></div>


{/* NAVBAR */}

<nav>

<h2>MedGuard AI</h2>

<div className="nav-links">

<a href="#features">Features</a>
<a href="#screenshots">Screenshots</a>
<a href="#team">Team</a>
<a href="#contact">Contact</a>

<a href="/login">Login</a>

</div>

</nav>


{/* HERO */}

<section className="hero">

<h1 id="typing"></h1>

<p>
A smart Medicine Reminder and Health Record Management System
that allows patients to store prescriptions, track doctor visits,
and receive timely medication alerts.
</p>

<button onClick={()=>window.location.href="/login"}>
Login / Register
</button>

</section>



{/* FEATURES */}

<section className="features hidden" id="features">

<h2>System Features</h2>

<div className="feature-grid">

<div className="card hidden">
<h3>💊 Medicine Reminder</h3>
<p>Automated alerts ensure patients never miss medication.</p>
</div>

<div className="card hidden">
<h3>📂 Medical Record Storage</h3>
<p>Securely upload prescriptions and health reports.</p>
</div>

<div className="card hidden">
<h3>🩺 Doctor Visits</h3>
<p>Maintain history of hospital and doctor consultations.</p>
</div>

<div className="card hidden">
<h3>🔐 Secure Authentication</h3>
<p>User login ensures privacy of health data.</p>
</div>

<div className="card hidden">
<h3>☁ Cloud Storage</h3>
<p>Access your medical data from anywhere.</p>
</div>

<div className="card hidden">
<h3>📱 Patient Friendly UI</h3>
<p>Simple interface designed for easy healthcare management.</p>
</div>

</div>

</section>



{/* SCREENSHOTS */}

<section className="screenshots hidden" id="screenshots">

<h2>Project Screenshots</h2>

<div className="screenshot-grid">

<img src="/images/dashboard1.png" alt="dashboard" />

<img src="/images/reminder.png" alt="reminder" />

<img src="/images/records.png" alt="records" />

</div>

</section>



{/* AI HEALTH TIP */}

<section className="tips hidden">

<h2>Daily Health Tip</h2>

<div className="tip-box" id="tip"></div>

</section>



{/* TEAM */}

<section className="team hidden" id="team">

<h2>Project Team</h2>

<div className="team-grid">

<div className="member">
<h3>Member 1</h3>
<p>Frontend Developer</p>
</div>

<div className="member">
<h3>Member 2</h3>
<p>Backend Developer</p>
</div>

<div className="member">
<h3>Member 3</h3>
<p>Database Manager</p>
</div>

</div>

</section>



{/* CONTACT */}

<section className="contact hidden" id="contact">

<h2>Contact Us</h2>

<form onSubmit={sendEmail}>

<input
type="text"
name="user_name"
placeholder="Name"
required
/>

<input
type="email"
name="user_email"
placeholder="Email"
required
/>

<textarea
rows="4"
name="message"
placeholder="Message"
required
></textarea>

<button type="submit">
Send
</button>

</form>

</section>




{/* FOOTER */}

<footer>

<p>© 2026 MedGuard AI Project</p>

</footer>


</div>

);

}

export default Home;