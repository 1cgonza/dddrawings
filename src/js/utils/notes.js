export default () => {
  const notes = document.getElementById('box');

  document.getElementById('notes').onclick = event => {
    event.preventDefault();
    notes.style.display = 'block';
  };

  document.getElementById('close-box').onclick = event => {
    event.preventDefault();
    notes.style.display = 'none';
  };
};
