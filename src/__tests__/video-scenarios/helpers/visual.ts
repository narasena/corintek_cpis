import { Page } from '@playwright/test';

/**
 * Injects a red ripple effect on every click event to make
 * user interactions visible in the recorded video.
 */
export async function injectRippleEffect(page: Page) {
  await page.addInitScript(() => {
    // Inject CSS
    const style = document.createElement('style');
    style.innerHTML = `
      .playwright-click-ripple {
        position: absolute;
        border-radius: 50%;
        transform: scale(0);
        animation: playwright-ripple-anim 600ms linear;
        background-color: rgba(220, 38, 38, 0.4); /* Tailwind red-600 with opacity */
        pointer-events: none;
        z-index: 999999;
      }
      @keyframes playwright-ripple-anim {
        to {
          transform: scale(4);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);

    // Add click listener
    document.addEventListener('click', e => {
      const ripple = document.createElement('div');
      ripple.className = 'playwright-click-ripple';

      const size = 30;
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      ripple.style.left = `${e.pageX - size / 2}px`;
      ripple.style.top = `${e.pageY - size / 2}px`;

      document.body.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });
}

/**
 * Types text with a realistic human delay to make forms
 * look like they are actually being filled out.
 */
export async function typeLikeHuman(
  page: Page,
  selector: string,
  text: string
) {
  const el = page.locator(selector);
  await el.click();
  await el.fill(''); // clear existing
  await el.pressSequentially(text, { delay: 100 });
}
