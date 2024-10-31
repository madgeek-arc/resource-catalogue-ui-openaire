/**
 * Created by stefanos on 2/3/2017.
 */

export function getCookie(name: string): string {
    const ca: Array<string> = document.cookie.split(';');
    const caLen: number = ca.length;
    const cookieName = `${name}=`;
    let c: string;
    for (let i = 0; i < caLen; i += 1) {
        c = ca[i].replace(/^\s+/g, '');
        if (c.indexOf(cookieName) === 0) {
            return c.substring(cookieName.length, c.length);
        }
    }
    return null;
}

export function deleteCookie(name) {
  console.log("Cookie Found? " + getCookie(name));
  var d: Date = new Date();
  d.setTime(d.getTime() + 2 * 1000);
  setCookie(name, '', d);
}

export function setCookie(name: string, value: string, expiration: Date, path: string = '/') {
    const expires = `expires=${expiration.toUTCString()}`;
    const cpath = path ? `; path=${path}` : '';
    document.cookie = `${name}=${value}; ${expires}${cpath}; sameSite=None; secure=true;`;
}
