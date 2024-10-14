export default () => {
  const box = document.getElementById('box');
  const notes = document.querySelector('#notes');
  const close = document.querySelector('#close-box');

  notes.addEventListener('click', (event) => {
    event.preventDefault();
    box.style.display = 'block';
  });

  close.onclick = (event) => {
    event.preventDefault();
    box.style.display = 'none';
  };
};
