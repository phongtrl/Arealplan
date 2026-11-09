// Moderne desktopmenyer; behold native select og mobilens systemvelger.
(() => {
  const desktop = matchMedia('(min-width:56rem)');
  const controls = new Map();
  let active = null, scheduled = false, sequence = 0;
  function close(restoreFocus = false) {
    if (!active) return;
    const {menu,button} = active;
    active = null;
    button.setAttribute('aria-expanded','false');
    if (menu.hidePopover && menu.matches(':popover-open')) menu.hidePopover();
    menu.remove();
    if (restoreFocus && button.isConnected && button.getClientRects().length) button.focus();
  }
  function labelFor(select, labels) {
    return select.getAttribute('aria-label') || labels.map(label => [...label.childNodes].filter(node => node.nodeType === Node.TEXT_NODE || node.nodeType === Node.ELEMENT_NODE && node.tagName === 'SPAN').map(node => node.textContent).join(' ').trim()).join(' ') || select.name || 'Velg alternativ';
  }
  function open(select, firstOrLast) {
    close();
    if (!desktop.matches || select.disabled) return;
    const {button,label} = controls.get(select);
    const menu = document.createElement('div');
    menu.className = 'desktop-select-menu';
    menu.id = button.getAttribute('aria-controls');
    menu.setAttribute('role','listbox');
    menu.setAttribute('aria-label',label);
    if (menu.showPopover) menu.setAttribute('popover','manual');
    const items = [...select.options].map((option,index) => {
      const item = document.createElement('button');
      item.type = 'button'; item.setAttribute('role','option'); item.tabIndex = -1;
      item.setAttribute('aria-selected',index === select.selectedIndex);
      item.disabled = option.disabled || option.parentElement.disabled === true;
      const text = document.createElement('span'); text.textContent = option.text;
      const mark = document.createElement('span'); mark.className = 'desktop-select-check'; mark.textContent = '✓'; mark.setAttribute('aria-hidden','true');
      item.append(text,mark);
      item.onclick = () => {
        select.selectedIndex = index;
        select.dispatchEvent(new Event('input',{bubbles:true}));
        select.dispatchEvent(new Event('change',{bubbles:true}));
        sync(); close(true);
      };
      menu.append(item);
      return item;
    });
    (select.closest('dialog[open]') || document.body).append(menu);
    if (menu.showPopover) menu.showPopover();
    const rect = button.getBoundingClientRect();
    const width = Math.min(Math.max(rect.width,220),innerWidth - 32);
    const below = innerHeight - rect.bottom - 16, above = rect.top - 16;
    const upwards = below < 180 && above > below;
    menu.style.width = width + 'px';
    menu.style.left = Math.max(16,Math.min(rect.left,innerWidth-width-16)) + 'px';
    menu.style.maxHeight = Math.max(80,Math.min(300,upwards ? above : below)) + 'px';
    if (upwards) menu.style.bottom = innerHeight-rect.top+6 + 'px';
    else menu.style.top = rect.bottom+6 + 'px';
    active = {select,button,menu,anchorTop:rect.top,anchorLeft:rect.left};
    button.setAttribute('aria-expanded','true');
    const enabled = items.filter(item => !item.disabled);
    (firstOrLast === 'last' ? enabled.at(-1) : firstOrLast === 'first' ? enabled[0] : items[select.selectedIndex] && !items[select.selectedIndex].disabled ? items[select.selectedIndex] : enabled[0])?.focus({preventScroll:true});
    let typed = '', typedAt = 0;
    menu.onkeydown = event => {
      const current = enabled.indexOf(document.activeElement);
      let next;
      if (event.key === 'ArrowDown') next = (current+1)%enabled.length;
      if (event.key === 'ArrowUp') next = (current-1+enabled.length)%enabled.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = enabled.length-1;
      if (next !== undefined) { event.preventDefault(); enabled[next]?.focus(); }
      else if (event.key.length === 1 && event.key !== ' ' && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        typed = performance.now()-typedAt > 700 ? event.key : typed+event.key; typedAt = performance.now();
        enabled.find(item => item.textContent.trim().toLocaleLowerCase('nb').startsWith(typed.toLocaleLowerCase('nb')))?.focus();
      }
    };
    menu.addEventListener('focusout', event => { if (active?.menu === menu && event.relatedTarget && !menu.contains(event.relatedTarget) && event.relatedTarget !== button) close(); });
  }
  function sync() {
    document.querySelectorAll('select:not([hidden])').forEach(select => {
      if (controls.has(select) || select.multiple || select.size > 1) return;
      const labels = [...select.labels];
      const wrapper = document.createElement('span'); wrapper.className = 'modern-select';
      select.before(wrapper); wrapper.append(select);
      const button = document.createElement('button'); button.type = 'button'; button.className = 'modern-select-trigger';
      button.id = 'desktop-select-' + (++sequence);
      button.setAttribute('aria-haspopup','listbox');button.setAttribute('aria-expanded','false');button.setAttribute('aria-controls',button.id+'-menu');
      const label = labelFor(select,labels);button.setAttribute('aria-label',label);
      const value = document.createElement('span');value.className = 'modern-select-value';
      const arrow = document.createElement('span');arrow.className = 'modern-select-arrow';arrow.setAttribute('aria-hidden','true');
      button.append(value,arrow);wrapper.append(button);
      controls.set(select,{button,value,label,labels});
      button.onclick = () => active?.select === select ? close() : open(select);
      button.onkeydown = event => { if (['ArrowDown','ArrowUp','Home','End'].includes(event.key)) {event.preventDefault();open(select,event.key === 'End' ? 'last' : event.key === 'Home' ? 'first' : undefined);} };
      select.addEventListener('change',sync);
    });
    for (const [select,control] of controls) {
      if (!select.isConnected) { controls.delete(select); continue; }
      const text = select.selectedOptions[0]?.text || 'Velg …';
      if (control.value.textContent !== text) control.value.textContent = text;
      if (control.button.disabled !== select.disabled) control.button.disabled = select.disabled;
      control.labels.forEach(label => { if (label.htmlFor && label.htmlFor !== (desktop.matches ? control.button.id : select.id)) label.htmlFor = desktop.matches ? control.button.id : select.id; });
    }
    if (active && (!desktop.matches || !active.button.getClientRects().length || !active.select.isConnected)) close();
  }
  document.addEventListener('pointerdown',event => {if (active && !active.menu.contains(event.target) && !active.button.contains(event.target)) close();},true);
  document.addEventListener('keydown',event => {if (active && event.key === 'Escape') {event.preventDefault();event.stopPropagation();close(true);}},true);
  document.addEventListener('scroll',event => {
    if (!active || active.menu.contains(event.target)) return;
    const rect = active.button.getBoundingClientRect();
    if (Math.abs(rect.top-active.anchorTop) > .5 || Math.abs(rect.left-active.anchorLeft) > .5) close();
  },true);
  window.addEventListener('resize',() => {close();sync();});
  window.addEventListener('hashchange',() => close());
  desktop.addEventListener('change',() => {close();sync();});
  new MutationObserver(() => {if (!scheduled) {scheduled=true;requestAnimationFrame(() => {scheduled=false;sync();});}}).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['open','hidden','disabled']});
  sync();
})();
