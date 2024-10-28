document.addEventListener('DOMContentLoaded', () => {
  const toggleButtons = document.querySelectorAll('.button.toggle');
  toggleButtons.forEach((button) => {
    button.addEventListener('mousedown', () => {
      button.classList.toggle('checked');
    });
  });
});
