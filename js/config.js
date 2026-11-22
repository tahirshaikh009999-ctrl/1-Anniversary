/* =====================================================================
   EDIT THIS SECTION ONLY
   ===================================================================== */
const CONFIG = {
  yourName: "TAHIR SHAIKH",
  herName: "MADIHA ANSARI",
  startDate: "22 Nov 2025",              // shown on the plaque
  anniversaryDate: "22 Nov 2026",
  firstDate: "2025-11-22",               // the day it all started (YYYY-MM-DD) - drives the clock
  firstTime: "00:00",                    // optional: the time of the first date, e.g. "19:30" (24-hour)
  wallQuote: "Our love is the best exhibit.",
  photoTone: "warm",                     // "none" | "warm" | "bw"
  /* MUSIC: put your song in an "audio" folder next to index.html and write its exact file name here.
     Example: "audio/our-song.mp3"   (use "" for no music). Only .mp3 or .m4a files, no YouTube/Spotify links. */
  music: "audio/our-song.mp3",
  musicVolume: 0.6,                      // 0 (silent) to 1 (full)
  /* ---- PERSONAL EXTRAS ---- */
  /* Secret question on the ticket screen. Leave question "" to skip it.
     Example: question:"Where was our first date?", answers:["blue door cafe","the cafe"], hint:"You were late." */
  gate: { question: "", answers: [], hint: "" },
  /* "A reason why" button picks one of these at random. Add as many as you like. */
  reasons: [
  "You make ordinary days feel like holidays.",
  "You stay kind even when you are tired, and I notice every time.",
  "Your laugh is my favourite sound, and I still work to earn it.",
  "With you, silence never feels awkward. It feels like home.",
  "You believe in me on the days I forget how.",
  "You turn small plans into the best memories.",
  "The way you light up when you talk about the things you love.",
  "You are brave in ways you do not even notice.",
  "You make me want to be a better person, without ever asking me to.",
  "Home is not a place anymore. It is wherever you are.",
  "You hold my hand like you mean it, every single time.",
  "Even your bad days are somehow full of grace.",
  "You listen to me, not just my words but what is underneath them.",
  "You made a whole year feel like a few lovely weeks.",
  "I love the way you say Aeee Taahirrrr.",
  "I fell for you a little more when I see you smile.",
  "Out of everyone in the world, I would choose you again, and again."
],
  letterTitle: "For when you have finished looking at the walls",
  letter:
`My love MADIHA,

One year. I wanted to give you something that could hold all of it, so I built you a little museum.

Every frame on that wall is something I would keep forever. Every ordinary day with you turned out to be an exhibit I never wanted to take down.

Thank you for this first year. I'm so excited for everything still to come.

Always yours,
TAHIR`
};

/* kind: rect | oval | heart.  cx, cy = centre on the wall, w, h = frame size (scene is 1000 x 1240).
   img: "photos/01.jpeg" ("" = placeholder).  pos: "top" | "center" | "bottom" (which part of the photo to keep). */
const MEMORIES = [
  {kind:"rect", cx:500,cy:250,w:190,h:140,rot:0,  num:"EXHIBIT 01", title:"The beginning of my favourite story",       date:"22nd November 2025", img:"photos/01.jpeg", pos:"center",
   story:"This is where it all started: our first date.\n\nI still remember you were waiting at the station and then we reached late to you, you were so composed and polite to me, You asked me to keep quiet and let you have the time to marinate. I admired you so much there when you were in my passenger seat. Since you came it has not been less than a blessing from Allah.  "},
  {kind:"oval", cx:262,cy:362,w:150,h:205,rot:-2, num:"EXHIBIT 02", title:"A day I would happily live again",           date:"10th Dec 2025", img:"photos/02.jpeg", pos:"center", story:"It wasnt an ordinary day, it was when you took me on a picnic date. You took me on a picnic date bb, I was happy so happy I had no words for the happiness that day, I cried the night when i came home because i was so happy to be with you."},
  {kind:"oval", cx:738,cy:402,w:150,h:205,rot:2,  num:"EXHIBIT 03", title:"An ordinary moment, made extraordinary",     date:"15th Dec 2025", img:"photos/03.jpeg", pos:"center", story:"I was always a sunset lover and then i met you, this day was very difficult for you, we had a problem, then we went to the beach to watch sunset my favourite thing to do and with the favourite person who would mean so much to me and i am scared of the world could take this away from me but the moment we were at the beach and watching sunset I felt so peace with you, I just cant put in words I hope i can make you feel the same."},
  {kind:"heart",cx:500,cy:472,w:150,h:140,rot:0,  num:"EXHIBIT 04", title:"My favourite kind of adventure",             date:"23rd Dec 2025", img:"photos/04.jpeg", pos:"center", story:"The day we went out on a date of our time, I had never been a good planner and this was the first time i had planned something so extensive, I wanted to make you feel loved because that was the least i could have done for you, We went to pottery had our time with your savage cute talks and ended the day on a high note. I just wanted you to be happy but I was the one who was happier seeing you enjoy and get happier."},
  {kind:"rect", cx:272,cy:644,w:186,h:136,rot:1,  num:"EXHIBIT 05", title:"A little more like home",                    date:"10th July 2026", img:"photos/05.jpeg", pos:"center", story:"This day holds a special place for me you made me feel like a kid again and that too with f1 chocolates, I just dont have words to appreciate you so much and I do appreciate you so much."},
  {kind:"rect", cx:730,cy:654,w:186,h:136,rot:-1, num:"EXHIBIT 06", title:"One year of choosing you",                   date:"17th Nov 2026", video:"photos/01.mp4", pos:"center", story:"We recently made this memory and this is one of my favourite memory, i never ever imagined the day could be so special but you made it special, you are the reason behind all the smile and the goofyness i have and I am getting old but Not Thirty yet, I want you to know that I am staying and I will treat you better and how you should be treated whatever it takes, we will make memories and achieve so many things together inshallah and I love youuu soo muchhhh bby."},
  {kind:"heart",cx:500,cy:642,w:140,h:130,rot:0,  num:"EXHIBIT 07", title:"Reserved for what happens next",             date:"Still to come", img:"", pos:"center", future:true,
   story:"This collection is not complete.\n\nThere are still places to go, ordinary days to treasure, and so much more of us to come."}
];
/* ===================================================================== */

