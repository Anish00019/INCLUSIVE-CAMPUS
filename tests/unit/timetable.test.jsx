import {it,expect,vi}from 'vitest';
import {render,screen}from '@testing-library/react';
import Timetable from '../../src/pages/student/Timetable';
vi.mock('../../src/context/DataContext',()=>({useData:()=>({db:null})}));
it('timetable renders a loading state before its asynchronous data exists',()=>{
 render(<Timetable/>);expect(screen.getByRole('status')).toHaveTextContent('Loading your timetable');
});
