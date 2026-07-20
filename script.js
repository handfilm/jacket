// Mobile nav toggle
document.addEventListener('DOMContentLoaded', () => {
  const burger = document.querySelector('.burger');
  const navlinks = document.querySelector('.navlinks');
  if (burger && navlinks) {
    burger.addEventListener('click', () => {
      navlinks.classList.toggle('open');
      burger.textContent = navlinks.classList.contains('open') ? 'CLOSE' : 'MENU';
    });
  }

  // RFQ / contact form handling (front-end only demo)
  document.querySelectorAll('form[data-rfq]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      form.style.display = 'none';
      const success = form.parentElement.querySelector('.form-success');
      if (success) success.classList.add('show');
    });
  });

  // Quantity tier chip -> highlight card
  document.querySelectorAll('.tiers .tier').forEach((tier) => {
    tier.addEventListener('click', () => {
      document.querySelectorAll('.tiers .tier').forEach(t => t.classList.remove('active'));
      tier.classList.add('active');
      const input = document.getElementById('qtyTierInput');
      if (input) input.value = tier.dataset.value || '';
    });
  });

  // current year in footer
  document.querySelectorAll('.cur-year').forEach(el => { el.textContent = new Date().getFullYear(); });
});
