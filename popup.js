    function SHA1(msg) {
        function rotate_left(n, s) {
          var t4 = (n << s) | (n >>> (32 - s));
          return t4;
        }
      
        function block_start() {
          w = new Array(80);
      
          for (var i = 0; i < 16; i++) {
            w[i] = (msg.charCodeAt(i * 4) << 24) |
              (msg.charCodeAt(i * 4 + 1) << 16) |
              (msg.charCodeAt(i * 4 + 2) << 8) |
              (msg.charCodeAt(i * 4 + 3));
          }
      
          for (var i = 16; i < 80; i++) {
            w[i] = rotate_left(w[i - 3] ^ w[i - 8] ^ w[i - 14] ^ w[i - 16], 1);
          }
        }
      
        // Shortcuts
        var K = [0x5a827999, 0x6ed9eba1, 0x8f1bbcdc, 0xca62c1d6];
      
        // Format the output
        function toHex(n) {
          var s = "", v;
      
          for (v = 0; v < n.length; v++) {
            s += (n.charCodeAt(v) < 16 ? "0" : "") + n.charCodeAt(v).toString(16);
          }
      
          return s.toUpperCase();
        }
      
        // Prepend padding and the length
        msg += String.fromCharCode(0x80);
      
        // Now pad the remaining length
        while (msg.length % 64 - 56) {
          msg += "\x00";
        }
      
        msg += toHex(msg.length * 8).slice(0, 8);// Set the HASH
        var HASH = new Array(5);
      
        HASH[0] = 0x67452301;
        HASH[1] = 0xefcdab89;
        HASH[2] = 0x98badcfe;
        HASH[3] = 0x10325476;
      
        // Process each block
        for (block_start(), mb = 0; mb < msg.length / 64; msg = msg.slice((block_start, len = 64))) {
      
          var a = HASH[0],
            b = HASH[1],
            c = HASH[2],
            d = HASH[3],
            f, g, temp;
      
          // Operate on each chunk
          for (var i = 0; i < 80; i++) {
      
            if (i < 16) {
              f = (b & c) | (b.not() & d);
            } else if (i < 32) {
              f = (d & b) | (d.not() & c);
            } else if (i < 48) {
              f = b ^ c ^ d;
            } else {
              f = c ^ (b | d.not());
            }
      
            g = (5 * i + 1) % 16;
      
            temp = d;
            d = c;
            c = b;
      
            b = b.add(rotate_left(a + f + K[i] + w[g], 1));
            a = temp;
      
          }
      
          HASH[0] = HASH[0].add(a);
          HASH[1] = HASH[1].add(b);
          HASH[2] = HASH[2].add(c);
          HASH[3] = HASH[3].add(d);
      
        }
      
        return HASH;
      }
    // (the rest of the SHA1 function remains unchanged from the previous response)
    function sendEmailToBackground() {
        const emailInput = document.getElementById("emailInput");
        const email = emailInput.value;
      
        chrome.runtime.sendMessage({ type: 'checkEmail', email: email });
      }
      
      function sendPasswordToBackground() {
        const passwordInput = document.getElementById("passwordInput");
        const password = passwordInput.value;
      
        chrome.runtime.sendMessage({ type: 'checkPassword', password: password });
      }
      
      document.getElementById("checkEmailBtn").addEventListener("click", sendEmailToBackground);
      document.getElementById("checkPasswordBtn").addEventListener("click", sendPasswordToBackground);
      
      // SHA1 and getPasswordHashSuffixes functions (same as before)
      
      
      document.getElementById("checkEmailBtn").addEventListener("click", sendEmailToBackground);
      document.getElementById("checkPasswordBtn").addEventListener("click", sendPasswordToBackground);
      
      // SHA1 and getPasswordHashSuffixes functions (same as before)

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
      
    //   chrome.runtime.onConnect.addListener((port) => {
    //     if (port.name === 'hibpChecker') {
    //       port.onMessage.addListener((msg) => {
    //         if (msg.type === 'checkEmail') {
    //           const emailInput = document.getElementById("emailInput");
    //           const email = emailInput.value;
    //           chrome.runtime.sendMessage({ type: 'checkEmail', email: email });
    //         } else if (msg.type === 'checkPassword') {
    //           const passwordInput = document.getElementById("passwordInput");
    //           const password = passwordInput.value;
    //           const hash = SHA1(password);
    //           const prefix = hash.substring(0, 5);
    //           const suffixes = getPasswordHashSuffixes(prefix);
      
    //           suffixes.then((suffixes) => {
    //             const isPwned = suffixes.some(s => s.suffix === hash.substring(5));
      
    //             if (isPwned) {
    //   alert("It appears your password has been found in a breach. Change your password immediately.");
    //             }
      
    //             chrome.runtime.sendMessage({ type: 'checkPassword', hash: hash });
    //           });
    //         }
    //       });
    //     }
    //   }); document.getElementById("checkPasswordBtn").addEventListener("click", sendPasswordToBackground);
      
      // SHA1 function and getPasswordHashSuffixes function (same as before)
  function getPasswordHashSuffixes(prefix) {
    return fetch(`https://api.pwnedpasswords.com/range/${prefix}`)
      .then(response => response.text())
      .then(hashes => {
        const lines = hashes.trim().split('\n');
  
        return lines.filter(line => {
          const [hash, count] = line.split(':');
  
          return hash.slice(5) === prefix;
        }).map((line) => {
          const [hash, count] = line.split(':');
  
          return {
            suffix: hash.slice(5),
            count: parseInt(count, 10)
          };
        });
      });
  }