import {ticketFontCSS} from 'virtual:invitro-typography';
import backdrop from './assets/ticket-kv.jpg?inline';
import {ticketArtwork} from './ticket-art';

export function standaloneTicket(number: string, name = '', earned = false, region = '') {
  return ticketArtwork({number, name, earned, region, backdrop, embeddedFontCSS:ticketFontCSS});
}
