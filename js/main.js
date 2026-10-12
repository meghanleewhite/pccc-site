// Psychiatric Care Coalition of Canada: site behaviour.
// No dependencies. Everything degrades gracefully without JS.
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Mobile menu ----------
  var menuBtn = document.querySelector('.menu-btn');
  var nav = document.getElementById('site-nav');
  if (menuBtn && nav) {
    var setMenu = function (open) {
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      nav.classList.toggle('is-open', open);
    };
    menuBtn.addEventListener('click', function () {
      setMenu(menuBtn.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); menuBtn.focus(); }
    });
  }

  // ---------- Always open at the top on refresh ----------
  // Stops the browser restoring an old scroll position (e.g. the founder section).
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  // ---------- Fixed header: keep the page offset equal to its real height ----------
  var header = document.querySelector('.site-header');
  var setHeaderHeight = function () {
    if (header) document.documentElement.style.setProperty('--hh', header.offsetHeight + 'px');
  };
  setHeaderHeight();
  window.addEventListener('resize', setHeaderHeight);
  window.addEventListener('load', setHeaderHeight);

  // ---------- In-page links scroll without adding #section to the URL ----------
  // So a refresh or a shared link opens at the top of the page.
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href^="#"]');
    if (!link) return;
    var id = link.getAttribute('href').slice(1);
    var target = id ? document.getElementById(id) : null;
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  });

  // ---------- Frosted header once the page scrolls ----------
  if (header) {
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // ---------- FAQ accordion (one open at a time) ----------
  var items = Array.prototype.slice.call(document.querySelectorAll('.acc-item'));
  items.forEach(function (item) {
    var btn = item.querySelector('button');
    btn.addEventListener('click', function () {
      var wasOpen = item.classList.contains('is-open');
      items.forEach(function (other) {
        other.classList.remove('is-open');
        other.querySelector('button').setAttribute('aria-expanded', 'false');
      });
      if (!wasOpen) {
        item.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // ---------- Count-up numbers ----------
  function countUp(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    if (reduceMotion || isNaN(target)) { el.textContent = target.toFixed(decimals); return; }
    var duration = 1400;
    var start = null;
    function frame(ts) {
      if (start === null) start = ts;
      var t = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = (target * eased).toFixed(decimals);
      if (t < 1) requestAnimationFrame(frame);
    }
    el.textContent = (0).toFixed(decimals);
    requestAnimationFrame(frame);
  }

  // ---------- Scroll reveal + count-up trigger ----------
  var reveals = document.querySelectorAll('.reveal');
  var counters = document.querySelectorAll('[data-count]');

  if (!('IntersectionObserver' in window) || reduceMotion) {
    Array.prototype.forEach.call(reveals, function (el) { el.classList.add('is-visible'); });
  } else {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObs.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    Array.prototype.forEach.call(reveals, function (el) { revealObs.observe(el); });

    var countObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          countUp(entry.target);
          countObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    Array.prototype.forEach.call(counters, function (el) { countObs.observe(el); });
  }

  // ---------- Mission carousel dots (mobile) ----------
  var track = document.querySelector('.pillars');
  var dots = document.querySelectorAll('.dots .dot');
  if (track && dots.length) {
    var cards = track.querySelectorAll('.pillar');
    var ticking = false;
    var update = function () {
      ticking = false;
      var left = track.getBoundingClientRect().left;
      var active = 0;
      var best = Infinity;
      Array.prototype.forEach.call(cards, function (card, i) {
        var d = Math.abs(card.getBoundingClientRect().left - left);
        if (d < best) { best = d; active = i; }
      });
      // Snap to the last dot when scrolled to the end
      if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 4) active = cards.length - 1;
      Array.prototype.forEach.call(dots, function (dot, i) { dot.classList.toggle('is-active', i === active); });
    };
    track.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
  }

  // ---------- Survey nudge ----------
  // Appears once the visitor scrolls past the hero. Hides while the survey
  // section is on screen. Dismissing it keeps it away for 14 days.
  var nudge = document.getElementById('nudge');
  var hero = document.querySelector('.hero');
  var survey = document.getElementById('survey');
  if (nudge && hero && survey && 'IntersectionObserver' in window) {
    var KEY = 'pccc-nudge-dismissed';
    var dismissed = false;
    try {
      var t = parseInt(localStorage.getItem(KEY) || '0', 10);
      dismissed = t && (Date.now() - t) < 14 * 864e5;
    } catch (err) {}
    if (!dismissed) {
      nudge.hidden = false;
      var pastHero = false, surveyInView = false;
      var render = function () { nudge.classList.toggle('is-shown', pastHero && !surveyInView); };
      new IntersectionObserver(function (es) { pastHero = !es[0].isIntersecting && es[0].boundingClientRect.top < 0; render(); }).observe(hero);
      new IntersectionObserver(function (es) { surveyInView = es[0].isIntersecting; render(); }, { threshold: 0.15 }).observe(survey);
      var hide = function () { nudge.classList.remove('is-shown'); setTimeout(function () { nudge.hidden = true; }, 450); };
      nudge.querySelector('.nudge-close').addEventListener('click', function () {
        try { localStorage.setItem(KEY, String(Date.now())); } catch (err) {}
        hide();
      });
      nudge.querySelector('.nudge-btn').addEventListener('click', function () { surveyInView = true; render(); });
    }
  }

  // ---------- Footer year ----------
  var year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();
})();
