import { Component } from 'react';
export default class ErrorBoundary extends Component {
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  componentDidCatch(error){console.error('Application view failed:',error.name);}
  render(){
    if(this.state.failed)return <main className="min-h-screen grid place-items-center bg-slate-50 p-6"><section className="card max-w-lg p-7" role="alert"><h1 className="text-xl font-bold">We could not open this workspace</h1><p className="text-sm muted mt-3">Your browser may have unavailable storage or an incomplete saved record. Reload to try again. No operation has been confirmed as saved by this message.</p><button className="btn-primary mt-5" onClick={()=>window.location.reload()}>Reload workspace</button><a className="btn-secondary mt-5 ml-2" href="/about#contact">Support information</a></section></main>;
    return this.props.children;
  }
}
