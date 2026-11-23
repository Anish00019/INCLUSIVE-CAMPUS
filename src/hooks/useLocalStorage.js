import { useCallback, useRef, useState } from 'react';

export default function useLocalStorage(key, initial) {
  const [value,setValue]=useState(()=>{
    try{
      const saved=JSON.parse(localStorage.getItem(key)||'null');
      if(saved===null||typeof saved!==typeof initial||Array.isArray(saved)!==Array.isArray(initial))return initial;
      if(typeof initial==='object'&&!Array.isArray(initial))return {...initial,...Object.fromEntries(Object.entries(saved).filter(([k,v])=>k in initial&&typeof v===typeof initial[k]))};
      return saved;
    }catch(error){console.warn('Saved preference could not be loaded:',error.name);return initial;}
  });
  const current=useRef(value);current.current=value;
  const set=useCallback(next=>{
    const resolved=typeof next==='function'?next(current.current):next;
    try{localStorage.setItem(key,JSON.stringify(resolved));}
    catch(error){console.warn('Preference was not persisted:',error.name);window.dispatchEvent(new Event('ic:storage-error'));return false;}
    current.current=resolved;setValue(resolved);return true;
  },[key]);
  return [value,set];
}
