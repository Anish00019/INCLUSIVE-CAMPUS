import { it, expect } from 'vitest';
import {useState} from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Modal from '../../src/components/common/Modal';
import {Tabs} from '../../src/components/common/ui';
import {validateAttachments,csvCell,dateOnly,phoneNumber} from '../../src/utils/validation';

it('modal keeps focus on the input as the parent rerenders while typing',async()=>{
  const user=userEvent.setup();
  function Harness(){const [value,setValue]=useState('');return <Modal open onClose={()=>{}} title="Edit record"><label htmlFor="test-name">Name</label><input id="test-name" value={value} onChange={e=>setValue(e.target.value)}/></Modal>;}
  render(<Harness/>);const input=screen.getByRole('textbox',{name:'Name'});await user.click(input);await user.type(input,'Accessible campus');await new Promise(r=>setTimeout(r,100));expect(input).toHaveFocus();expect(input).toHaveValue('Accessible campus');
});
it('modal escape closes and restores focus to its invoker',async()=>{
  const user=userEvent.setup();function Harness(){const[open,setOpen]=useState(false);return <><button onClick={()=>setOpen(true)}>Open dialog</button><Modal open={open} onClose={()=>setOpen(false)} title="Confirm"><button>Last control</button></Modal></>;}
  render(<Harness/>);const trigger=screen.getByRole('button',{name:'Open dialog'});await user.click(trigger);expect(screen.getByRole('dialog',{name:'Confirm'})).toBeInTheDocument();await user.keyboard('{Escape}');expect(screen.queryByRole('dialog')).not.toBeInTheDocument();expect(trigger).toHaveFocus();
});
it('dialog traps keyboard focus without selecting hidden file inputs',async()=>{
  const user=userEvent.setup();render(<Modal open onClose={()=>{}} title="Files"><input type="file" className="sr-only" aria-label="Hidden file"/><button>Choose file</button><button>Save file</button></Modal>);
  await waitFor(()=>expect(screen.getByRole('button',{name:'Close dialog'})).toHaveFocus());const save=screen.getByRole('button',{name:'Save file'});save.focus();await user.tab();expect(screen.getByRole('button',{name:'Close dialog'})).toHaveFocus();
});
it('tabs implement arrow, Home and End keyboard controls',async()=>{
  const user=userEvent.setup();function Harness(){const[value,set]=useState('a');return <Tabs value={value} onChange={set} tabs={[{value:'a',label:'First'},{value:'b',label:'Second'},{value:'c',label:'Third'}]}/>;}
  render(<Harness/>);screen.getByRole('tab',{name:'First'}).focus();await user.keyboard('{ArrowRight}');expect(screen.getByRole('tab',{name:'Second'})).toHaveAttribute('aria-selected','true');await user.keyboard('{End}');expect(screen.getByRole('tab',{name:'Third'})).toHaveFocus();await user.keyboard('{Home}');expect(screen.getByRole('tab',{name:'First'})).toHaveFocus();
});
it('attachment limits reject unsupported, empty and oversized documents',()=>{
  expect(()=>validateAttachments([new File(['x'],'malware.exe')])).toThrow(/Unsupported/);
  expect(()=>validateAttachments([{name:'large.pdf',size:5*1024*1024+1}])).toThrow(/5 MB/);
  expect(()=>validateAttachments([new File([],'empty.txt')])).toThrow(/Empty/);
  expect(()=>validateAttachments(Array.from({length:4},()=>new File(['x'],'note.txt')))).toThrow(/3/);
  expect(validateAttachments([new File(['x'],'note.PDF')])).toHaveLength(1);
});
it('CSV exports neutralise formula injection and escape embedded quotes',()=>{
  expect(csvCell('=HYPERLINK("https://evil")')).toBe('"\'=HYPERLINK(""https://evil"")"');expect(csvCell('ordinary value')).toBe('"ordinary value"');
});
it('calendar and phone validation handle boundaries',()=>{
  expect(()=>dateOnly('2026-02-30')).toThrow();expect(dateOnly('2028-02-29')).toBe('2028-02-29');expect(()=>phoneNumber('phone-not-valid')).toThrow();expect(phoneNumber('+91 98110 44521')).toBe('+91 98110 44521');expect(phoneNumber('')).toBe('');
});

it('dropdown keyboard navigation restores focus on Escape',async()=>{
  const {default:Dropdown,MenuItem}=await import('../../src/components/common/Dropdown');const user=userEvent.setup();render(<Dropdown trigger={<span>Account</span>} label="Account menu"><MenuItem>Profile</MenuItem><MenuItem>Settings</MenuItem><MenuItem>Sign out</MenuItem></Dropdown>);
  const trigger=screen.getByTitle('Account menu');trigger.focus();await user.keyboard('{ArrowDown}');expect(screen.getByRole('menuitem',{name:'Profile'})).toHaveFocus();await user.keyboard('{End}');expect(screen.getByRole('menuitem',{name:'Sign out'})).toHaveFocus();await user.keyboard('{Home}{ArrowDown}');expect(screen.getByRole('menuitem',{name:'Settings'})).toHaveFocus();await user.keyboard('{Escape}');expect(screen.queryByRole('menu')).not.toBeInTheDocument();expect(trigger).toHaveFocus();
});

it('local-storage hook rejects corrupt shapes and does not confirm a failed write',async()=>{
  const {renderHook,act}=await import('@testing-library/react');const {default:useLocalStorage}=await import('../../src/hooks/useLocalStorage');const {vi}=await import('vitest');localStorage.setItem('qa-pref','"wrong shape"');
  const hook=renderHook(()=>useLocalStorage('qa-pref',{enabled:true}));expect(hook.result.current[0]).toEqual({enabled:true});
  vi.spyOn(Storage.prototype,'setItem').mockImplementation(()=>{throw new DOMException('Full','QuotaExceededError');});let success;act(()=>{success=hook.result.current[1]({enabled:false});});expect(success).toBe(false);expect(hook.result.current[0]).toEqual({enabled:true});
});
