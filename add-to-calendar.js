/**
 * Creative Waco — Add to calendar widget for Webflow CMS event pages.
 *
 * Usage (Event template): wrap a button + menu root in an element with
 * `data-cw-add-to-calendar` and bind CMS fields to data attributes (see below).
 *
 * Required attributes:
 *   data-cw-title          — Event name (Plain Text / Name)
 *   data-cw-start          — Start DateTime (ISO 8601), e.g. from Start DateTime field
 *
 * Optional:
 *   data-cw-end            — End DateTime (ISO). If omitted, defaults to 1 hour after start.
 *   data-cw-location       — Plain Text location
 *   data-cw-description    — Plain Text or short excerpt (avoid Rich Text in attributes)
 *   data-cw-url            — Canonical event page URL (Link or full URL field)
 *   data-cw-uid-slug       — Stable id segment (e.g. CMS slug) for recurring ICS UID
 *
 * Webflow CMS field slugs (Events collection): name, slug, start-date-time,
 * end-date-time, location, short-description, primary-cta-url, etc.
 *
 * Load after DOM: <link rel="stylesheet" href="add-to-calendar.css"> (optional)
 * <script src="add-to-calendar.js" defer></script>
 *
 * Trigger (open menu): an element inside the root with class `.cw-cal__trigger`
 * OR custom attribute `data-cw-cal-trigger` (use one or the other on your Webflow
 * Button / Link so the control can be styled in Designer).
 */
(function () {
  'use strict';

  var ATTR = 'data-cw-add-to-calendar';
  /** Prefer attribute hook so a native Webflow button does not need a specific class. */
  var TRIGGER_SEL = '[data-cw-cal-trigger], .cw-cal__trigger';

  function parseInstant(value) {
    if (value == null || value === '') return null;
    var s = String(value).trim();
    if (/^\d+$/.test(s)) {
      var ms = parseInt(s, 10);
      var d = new Date(ms);
      return isNaN(d.getTime()) ? null : d;
    }
    var parsed = new Date(s);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  function stripHtml(html) {
    if (!html) return '';
    return String(html)
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function pad2(n) {
    return (n < 10 ? '0' : '') + n;
  }

  /** Format as UTC compact: YYYYMMDDTHHmmssZ */
  function formatUtcCompact(d) {
    return (
      d.getUTCFullYear() +
      pad2(d.getUTCMonth() + 1) +
      pad2(d.getUTCDate()) +
      'T' +
      pad2(d.getUTCHours()) +
      pad2(d.getUTCMinutes()) +
      pad2(d.getUTCSeconds()) +
      'Z'
    );
  }

  function escapeIcsText(str) {
    return String(str)
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '');
  }

  /** Fold long lines per RFC 5545 (octets ~75; ASCII safe here). */
  function foldLine(line) {
    var max = 75;
    if (line.length <= max) return line;
    var out = '';
    var rest = line;
    while (rest.length > max) {
      out += rest.slice(0, max) + '\r\n ';
      rest = rest.slice(max);
    }
    return out + rest;
  }

  function buildGoogleUrl(ev) {
    var dates = formatUtcCompact(ev.start) + '/' + formatUtcCompact(ev.end);
    var q = new URLSearchParams();
    q.set('action', 'TEMPLATE');
    q.set('text', ev.title);
    q.set('dates', dates);
    if (ev.details) q.set('details', ev.details);
    if (ev.location) q.set('location', ev.location);
    return 'https://calendar.google.com/calendar/render?' + q.toString();
  }

  function buildOutlookUrl(ev, origin) {
    var q = new URLSearchParams();
    q.set('subject', ev.title);
    q.set('startdt', ev.start.toISOString());
    q.set('enddt', ev.end.toISOString());
    if (ev.details) q.set('body', ev.details);
    if (ev.location) q.set('location', ev.location);
    return origin + '/calendar/0/deeplink/compose?' + q.toString();
  }

  function buildYahooUrl(ev) {
    var q = new URLSearchParams();
    q.set('v', '60');
    q.set('view', 'd');
    q.set('type', '20');
    q.set('title', ev.title);
    q.set('st', formatUtcCompact(ev.start));
    q.set('et', formatUtcCompact(ev.end));
    if (ev.details) q.set('desc', ev.details);
    if (ev.location) q.set('in_loc', ev.location);
    return 'https://calendar.yahoo.com/?' + q.toString();
  }

  function sanitizeUidSegment(str) {
    var s = String(str || 'event')
      .replace(/[^\w.-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return s || 'event';
  }

  function buildIcs(ev) {
    var uid = sanitizeUidSegment(ev.uidSlug || ev.title) + '@creativewaco.org';
    var stamp = formatUtcCompact(new Date());
    var lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Creative Waco//Add To Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'UID:' + uid,
      'DTSTAMP:' + stamp,
      'DTSTART:' + formatUtcCompact(ev.start),
      'DTEND:' + formatUtcCompact(ev.end),
      'SUMMARY:' + escapeIcsText(ev.title),
    ];
    if (ev.details) {
      lines.push('DESCRIPTION:' + escapeIcsText(ev.details));
    }
    if (ev.location) {
      lines.push('LOCATION:' + escapeIcsText(ev.location));
    }
    if (ev.url) {
      lines.push('URL:' + escapeIcsText(ev.url));
    }
    lines.push('END:VEVENT', 'END:VCALENDAR');

    return lines
      .map(function (line) {
        return foldLine(line);
      })
      .join('\r\n');
  }

  function downloadIcs(filename, body) {
    var blob = new Blob([body], {
      type: 'text/calendar;charset=utf-8',
    });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function safeFilename(title) {
    var base = title.replace(/[^a-zA-Z0-9-_]+/g, '-').replace(/^-|-$/g, '');
    return (base || 'event') + '.ics';
  }

  function readEventFromEl(root) {
    var title = root.getAttribute('data-cw-title');
    var start = parseInstant(root.getAttribute('data-cw-start'));
    if (!title || !start) return null;

    var end = parseInstant(root.getAttribute('data-cw-end'));
    if (!end || end <= start) {
      end = new Date(start.getTime() + 60 * 60 * 1000);
    }

    var desc = root.getAttribute('data-cw-description');
    var loc = root.getAttribute('data-cw-location');
    var pageUrl = root.getAttribute('data-cw-url');
    var uidSlug = root.getAttribute('data-cw-uid-slug');

    var details = desc ? stripHtml(desc) : '';
    var url = pageUrl ? stripHtml(pageUrl) : '';
    if (url && details.indexOf(url) === -1) {
      details = details ? details + '\n\n' + url : url;
    } else if (url && !details) {
      details = url;
    }

    return {
      title: title,
      start: start,
      end: end,
      details: details,
      location: loc ? stripHtml(loc) : '',
      url: url,
      uidSlug: uidSlug || '',
    };
  }

  function closeOthers(except) {
    document.querySelectorAll('[' + ATTR + '].is-open').forEach(function (el) {
      if (el !== except) {
        el.classList.remove('is-open');
        var b = el.querySelector(TRIGGER_SEL);
        if (b) b.setAttribute('aria-expanded', 'false');
      }
    });
  }

  function wire(root) {
    var ev = readEventFromEl(root);
    if (!ev) {
      root.style.display = 'none';
      if (window.console && console.warn) {
        console.warn('[cw-cal] Missing data-cw-title or data-cw-start', root);
      }
      return;
    }

    var trigger = root.querySelector(TRIGGER_SEL);
    var panel = root.querySelector('.cw-cal__panel');
    if (!trigger || !panel) return;

    var google = panel.querySelector('[data-cw-cal-link="google"]');
    var outlookCom = panel.querySelector('[data-cw-cal-link="outlook"]');
    var outlookLive = panel.querySelector('[data-cw-cal-link="outlook-live"]');
    var yahoo = panel.querySelector('[data-cw-cal-link="yahoo"]');
    var icsBtn = panel.querySelector('[data-cw-cal-link="ics"]');

    if (google) google.href = buildGoogleUrl(ev);
    if (outlookCom) outlookCom.href = buildOutlookUrl(ev, 'https://outlook.office.com');
    if (outlookLive) outlookLive.href = buildOutlookUrl(ev, 'https://outlook.live.com');
    if (yahoo) yahoo.href = buildYahooUrl(ev);

    if (icsBtn) {
      icsBtn.addEventListener('click', function (e) {
        e.preventDefault();
        var ics = buildIcs(ev);
        downloadIcs(safeFilename(ev.title), ics);
        root.classList.remove('is-open');
        trigger.setAttribute('aria-expanded', 'false');
      });
    }

    trigger.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var open = !root.classList.contains('is-open');
      closeOthers(open ? root : null);
      root.classList.toggle('is-open', open);
      trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    document.addEventListener('click', function () {
      root.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
    });

    root.addEventListener('click', function (e) {
      e.stopPropagation();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        root.classList.remove('is-open');
        trigger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  function init() {
    document.querySelectorAll('[' + ATTR + ']').forEach(wire);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
