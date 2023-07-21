import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import 'notiflix/dist/notiflix-3.2.6.min.css';
import axios from 'axios';
import { creatGalleryMarkup } from './markup';

const URL = 'https://pixabay.com/api/';
let page = 1;
let search = '';
const key = '38388037-1512b522da0d657b891be2adb';

const form = document.querySelector('.search-form');
const gallery = document.querySelector('.gallery');
const target = document.querySelector('.js-guard');

form.addEventListener('submit', onClick);

async function onClick(e) {
  e.preventDefault();
  const {
    elements: { searchQuery },
  } = e.currentTarget;
  gallery.innerHTML = '';
    page = 1;
  search = searchQuery.value;
  if (search.trim()) {
    try {
      console.log(search + 'dwcwc');
      let data = await getPictures(page, search);
      if (data.data.total === 0) {
        Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      } else {
        gallery.insertAdjacentHTML(
          'beforeend',
          data.data.hits.map(object => creatGalleryMarkup(object)).join('')
        );
          Notify.success(`Hooray! We found ${data.data.totalHits} images.`);
          if (page < Math.ceil(data.data.totalHits / 40)) {
              console.log(Math.ceil(data.data.totalHits / 40))
              observer.observe(target); 
          }
        
      }
    } catch (error) {}
  }
}

let options = {
  root: null,
  rootMargin: '300px',
  threshold: 0,
};

let observer = new IntersectionObserver(observerHandler, options);

function observerHandler(entries, observer) {
  entries.forEach(async element => {
    if (element.isIntersecting) {
      page += 1;
      try {
        let response = await getPictures(page, search);
        gallery.insertAdjacentHTML(
          'beforeend',
          response.data.hits.map(object => creatGalleryMarkup(object)).join('')
        );
      } catch (error) {
          Notify.info("You have seen all pictures!")
      }
    }
  });
}

async function getPictures(page, value) {
  const response = await axios(
    `${URL}?key=${key}&q=${value}&image_type=photo$orientation=horizontal&safesearch=true&per_page=40&page=${page}`
  );
  return response;
}
