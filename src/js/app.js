/* eslint-disable prettier/prettier */
import { interval, of } from "rxjs";
import {
  switchMap, map, catchError
} from 'rxjs/operators';
import { ajax } from 'rxjs/ajax';

let timestamp = 0;
const url = "https://ahj-rxjs-polling-server.onrender.com/messages/unread/";
let messagesLength = 0;

const stream$ = interval(2000).pipe(
  switchMap(() => ajax.get(url + timestamp)
    .pipe(
      map(({ response }) => {
        timestamp = response.timestamp || timestamp;
        return response.messages;
      }),
      catchError((error) => {
        return of( error.response );
      }),
    )),
)

const container = document.querySelector('.polling__container');
const getSubject = str => {
  return str.length > 15 ? str.substring(0, 15) + '...' : str;
};

const getDate = time => {
  const date = new Date(time);
  return date.getHours() + ':' + date.getMinutes() + ' ' + date.toLocaleDateString();
}

stream$.subscribe((arr) => {
  if (!arr) return;

  for (let i = messagesLength; i < arr.length; i++) {
    const message = document.createElement('div');
    message.className = 'message';
    message.innerHTML = `
      <span class="message__from">${arr[i].from}</span>
      <span class="message__subject">${getSubject(arr[i].subject)}</span>
      <span class="message__time">${getDate(arr[i].received).toLocaleString()}</span>
    `;
    container.prepend(message); 
  }

  messagesLength = arr.length;
});
