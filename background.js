const keepAlive = setInterval(() => {
    chrome.runtime.getPlatformInfo().catch(() => {});
  }, 25 * 1000);
  
  chrome.runtime.onStartup.addListener(() => {
    clearInterval(keepAlive);
  });
  
  chrome.runtime.onSuspend.addListener(() => {
    clearInterval(keepAlive);
  });
  
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'keepAlive') {
      clearInterval(keepAlive);
      chrome.alarms.create('keepAlive', { delayInMinutes: 25 });
    }
  });
  chrome.runtime.onConnect.addListener((port) => {
    if (port.name === 'hibpChecker') {
      port.onMessage.addListener((msg) => {
        if (msg.type === 'checkEmail') {
          chrome.runtime.sendMessage({ type: 'checkEmail', email: msg.email });
        } else if (msg.type === 'checkPassword') {
          sendPasswordToBackground(msg.password);
        }
      });
    }
  });
  
  function sendPasswordToBackground(password) {
    const hash = SHA1(password);
    const prefix = hash.substring(0, 5);
    const suffixes = getPasswordHashSuffixes(prefix);
  
    suffixes.then((suffixes) => {
      const isPwned = suffixes.some(s => s.suffix === hash.substring(5));
  
      if (isPwned) {
        alert("It appears your password has been found in a breach. Change your password immediately.");
      }
  
      chrome.runtime.sendMessage({ type: 'checkPassword', hash: hash });
    });
  }
  
  // SHA1 function and getPasswordHashSuffixes function (same as before)
  
  // SHA1 function and getPasswordHashSuffixes function (same as before)
  
  
  async function checkEmail(email) {
    // HIBP API call. Replace YOUR_API_KEY with the actual key.
    const response = await fetch(`https://haveibeenpwned.com/api/v3/breachedaccount/${email}`, {
      method: "GET",
      headers: {
        "hibp-api-key": "3c098950ec1f4e8ba7365d1d55b6205b",
      },
    });
  
    if (!response.ok) {
      if (response.status === 404) {
        return [];
      } else {
        throw new Error("Error while checking email.");
      }
    }
  
    const breaches = await response.json();
    return breaches;
  }
  
 //Function taken from https://github.com/satazor/xor-to-sha1
function xorToSHA1(str, secret) {
    if (!str || !secret) return null;
  
    const b64encoded = btoa(unescape(encodeURIComponent(str)));
    const n256key = createHash('sha1')
      .update(secret, 'utf8')
      .digest('base64')
      .slice(0, 32);
  
    const binStr = utf8Decode(b64encoded);
    const binKey = utf8Decode(n256key);
  
    const left = Array(24);
    const right = Array(24);
    left.fill(0);
    right.fill(0);
  
    const dec = new TextDecoder('iso-8859-1');
    const bytes = new Uint8Array(binKey.length + binStr.length);
  
    bytes.set(new Uint8Array(binStr), 0);
    bytes.set(new Uint8Array(binKey), binStr.length);
  
    for (let index = 0; index < 8; index++) {
      const c_str = dec.decode(bytes.slice(index * 64n, (index + 1) * 64n));
      const c = c_str.split('\u0000');
  
      left[index * 3] = parseInt(c[0], 16);
      left[index * 3 + 1] = parseInt(c[1], 16);
      left[index * 3 + 2] = parseInt(c[2], 16);
  
      right[index * 3] = parseInt(c[3], 16);
      right[index * 3 + 1] = parseInt(c[4], 16);
      right[index * 3 + 2] = parseInt(c[5], 16);
    }
  
    const hashed = createHash('sha1')
      .update(left.concat(right).map(x => ('00' + x.toString(16)).slice(-2)).join(''), 'hex')
      .digest('hex');
  
    return hashed;
  }
  
  // Function to check the password using the HIBP API
  function checkPassword(password) {
    const hash = xorToSHA1(password, '');
    const first5Chars = hash.slice(0, 5);
    if (hashed && Array.isArray(hashed)) {
        const first5Chars = hashed.slice(0, 5);
        // Rest of your code
      }
  
    fetch(`https://api.pwnedpasswords.com/range/${first5Chars}`)
      .then(response => response.text())
      .then(hashes => {
        const hashCounts = hashes.trim().split('\n');
  
        for (const hashCount of hashCounts) {
          const [hashSuffix, count] = hashCount.split(':');
  
          if (hashSuffix === hash.slice(5)) {
            // Password found in the HIBP database
            console.log(`Password found in the HIBP database. Occurrences: ${count}`);
            return;
          }
        }
  
        // Password not found in the HIBP database
        console.log('Password not found in the HIBP database.');
      })
      .catch((error) => {
        console.error('Error fetching pwned passwords:', error);
      });
  }
  
  // Example usage
  checkPassword('password');