export default () => {
  const container = document.getElementById('video-container');
  const back = document.createElement('button');
  const forward = document.createElement('button');

  const back2 = document.createElement('button');
  const forward2 = document.createElement('button');

  const back3 = document.createElement('button');
  var forward3 = document.createElement('button');

  const back4 = document.createElement('button');
  const forward4 = document.createElement('button');

  back.innerHTML = '&larr;';
  forward.innerHTML = '&rarr;';

  back2.innerHTML = '&larr;';
  forward2.innerHTML = '&rarr;';

  back3.innerHTML = '&larr;';
  forward3.innerHTML = '&rarr;';

  back4.innerHTML = '&larr;';
  forward4.innerHTML = '&rarr;';

  back.onclick = () => {
    video.currentTime -= 0.0001;
    console.log(video.currentTime);
  };

  forward.onclick = () => {
    video.currentTime += 0.0001;
    console.log(video.currentTime);
  };

  back2.onclick = () => {
    video.currentTime -= 0.001;
    console.log(video.currentTime);
  };

  forward2.onclick = () => {
    video.currentTime += 0.001;
    console.log(video.currentTime);
  };

  back3.onclick = () => {
    video.currentTime -= 0.01;
    console.log(video.currentTime);
  };

  forward3.onclick = () => {
    video.currentTime += 0.01;
    console.log(video.currentTime);
  };

  back4.onclick = () => {
    video.currentTime -= 0.1;
    console.log(video.currentTime);
  };

  forward4.onclick = () => {
    video.currentTime += 0.1;
    console.log(video.currentTime);
  };

  container.appendChild(back);
  container.appendChild(forward);
  container.appendChild(document.createElement('div'));

  container.appendChild(back2);
  container.appendChild(forward2);
  container.appendChild(document.createElement('div'));

  container.appendChild(back3);
  container.appendChild(forward3);
  container.appendChild(document.createElement('div'));

  container.appendChild(back4);
  container.appendChild(forward4);
};
