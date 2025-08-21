document.addEventListener("DOMContentLoaded", () => {
  let currentStep = 0;
  const steps = document.querySelectorAll(".funnel-step");
  const progress = document.querySelector(".progress > div");

  function showStep(index) {
    steps.forEach((step, i) => {
      step.style.display = i === index ? "block" : "none";
    });
    const percent = ((index + 1) / steps.length) * 100;
    if (progress) progress.style.width = percent + "%";
  }

  document.querySelectorAll(".next").forEach(btn => {
    btn.addEventListener("click", e => {
      e.preventDefault();
      if (currentStep < steps.length - 1) {
        currentStep++;
        showStep(currentStep);
      }
    });
  });

  document.querySelectorAll(".back").forEach(btn => {
    btn.addEventListener("click", e => {
      e.preventDefault();
      if (currentStep > 0) {
        currentStep--;
        showStep(currentStep);
      }
    });
  });

  showStep(currentStep);

  // Loan calculator
  const calcForm = document.querySelector("#loan-calculator");
  if (calcForm) {
    calcForm.addEventListener("input", () => {
      const amount = parseFloat(calcForm.querySelector("#loan-amount").value) || 0;
      const rate = parseFloat(calcForm.querySelector("#interest-rate").value) || 0;
      const term = parseInt(calcForm.querySelector("#loan-term").value) || 0;

      const monthlyRate = rate / 100 / 12;
      let monthlyPayment = 0;

      if (monthlyRate > 0 && term > 0) {
        monthlyPayment =
          (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -term));
      }

      const result = calcForm.querySelector("#calc-result");
      if (result) {
        result.textContent =
          monthlyPayment > 0
            ? `Estimated Monthly Payment: $${monthlyPayment.toFixed(2)}`
            : "";
      }
    });
  }
});
