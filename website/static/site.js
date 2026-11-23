function addCopyButton(container, code) {
  const button = document.createElement('button');
  button.className = 'copy';
  button.type = 'button';
  button.textContent = 'Copy';

  const feedback = document.createElement('span');
  feedback.className = 'copy-feedback';
  feedback.setAttribute('role', 'status');
  container.append(button, feedback);

  let resetLabel;
  function resetCopyFeedback() {
    clearTimeout(resetLabel);
    button.textContent = 'Copy';
    feedback.textContent = '';
  }

  code.addEventListener('commandchange', resetCopyFeedback);
  button.addEventListener('click', async () => {
    clearTimeout(resetLabel);
    try {
      await navigator.clipboard.writeText(code.textContent);
      button.textContent = 'Copied';
      feedback.textContent = 'Code copied to clipboard.';
    } catch {
      button.textContent = 'Copy failed';
      feedback.textContent = 'Could not copy. Select the code to copy it.';
    }
    resetLabel = setTimeout(resetCopyFeedback, 2400);
  });
}

if (navigator.clipboard?.writeText) {
  const terminal = document.querySelector('.terminal');
  if (terminal) addCopyButton(terminal.querySelector('[data-copy]'), terminal.querySelector('code'));

  for (const code of document.querySelectorAll('.prose pre > code')) {
    const pre = code.parentElement;
    const wrapper = document.createElement('div');
    wrapper.className = 'code-sample';
    pre.before(wrapper);
    wrapper.append(pre);
    addCopyButton(wrapper, code);
  }
}
