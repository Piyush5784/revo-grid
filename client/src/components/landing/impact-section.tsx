import React from "react";

export const ImpactSection = () => {
  return (
    <section className="w-full flex justify-center items-center py-16 bg-white">
      <div className="max-w-6xl w-full flex flex-col md:flex-row gap-12 px-4 md:px-[64px]">
        {/* Left Side */}
        <div className="flex-1 flex flex-col justify-center animate-fade-in-up">
          <span className="text-sm text-gray-700 mb-2">Impact speaks</span>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 leading-tight mb-2">
            Our AI Digital Workers<br />
            automate what slows you down
          </h2>
        </div>
        {/* Right Side */}
        <div className="flex-1 flex flex-col gap-6 animate-fade-in-up delay-150">
          <div className="text-sm text-gray-600 mb-2">
            85% of work is manual - Here's what happens when you automate it
          </div>
          <div className="flex flex-col md:flex-row gap-8 mb-4">
            <div>
              <div className="text-lg font-bold text-slate-800 mb-1">20%</div>
              <div className="font-semibold text-slate-800 mb-1">Increased working capital</div>
              <div className="text-gray-600 text-sm">
                In a pilot with 4 SMEs, we freed $500,000 in cash, demonstrating the power of our AI-driven solutions.
              </div>
            </div>
            <div>
              <div className="text-lg font-bold text-slate-800 mb-1">60-80%</div>
              <div className="font-semibold text-slate-800 mb-1">Faster cycle time</div>
              <div className="text-gray-600 text-sm">
                Our AI Document Parser assisted finance teams speed up revenue recognition- from weeks to &lt;3 days
              </div>
            </div>
          </div>
          <div className="flex gap-4 mt-2">
            <button className="px-6 py-2 rounded-full border border-orange-300 text-slate-800 font-semibold bg-white hover:bg-orange-50 transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-200 animate-bounce-in">
              Get Started
            </button>
            <a href="#" className="flex items-center px-4 py-2 text-orange-600 font-semibold hover:underline group">
              Learn More
              <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

// Tailwind CSS Animations (add to your global CSS if not already present)
// .animate-fade-in-up {
//   @apply opacity-0 translate-y-8;
//   animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
// }
// .animate-bounce-in {
//   animation: bounceIn 0.7s cubic-bezier(0.68, -0.55, 0.27, 1.55) 0.2s both;
// }
// @keyframes fadeInUp {
//   to {
//     opacity: 1;
//     transform: translateY(0);
//   }
// }
// @keyframes bounceIn {
//   0% {
//     opacity: 0;
//     transform: scale(0.8);
//   }
//   60% {
//     opacity: 1;
//     transform: scale(1.05);
//   }
//   100% {
//     opacity: 1;
//     transform: scale(1);
//   }
// } 