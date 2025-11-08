import express from 'express';
import fetch from 'node-fetch';
import path from 'path';

const app = express();

const atob = (str) => Buffer.from(str, 'base64').toString('utf-8');
const btoa = (str) => Buffer.from(str, 'utf-8').toString('base64');

const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

app.get('/stealth', async (req, res) => {
    const encodedUrl = req.query.url;
    if (!encodedUrl) {
        return res.status(400).send('Missing URL');
    }

    let targetUrl;
    try {
        targetUrl = atob(encodedUrl);
        targetUrl = decodeURIComponent(targetUrl);
    } catch (err) {
        console.error('Error decoding URL:', err);
        return res.status(400).send('Invalid URL encoding');
    }

    try {
        new URL(targetUrl);
    } catch (err) {
        console.error('Invalid URL format:', targetUrl);
        return res.status(400).send('Invalid URL format');
    }

    console.log('Fetching URL:', targetUrl);

    try {
        const response = await fetch(targetUrl, { redirect: 'follow' });
        if (!response.ok) {
            console.error(`Failed to fetch. Status code: ${response.status}`);
            return res.status(500).send('Error fetching the site');
        }

        let body = await response.text();
        const baseUrl = new URL(targetUrl).origin;

        body = body.replace(/(href|src)="(\/?[^"]+)"/g, (match, p1, p2) => {
            if (p2.startsWith('http')) {
                return match;
            }
            const resourceUrl = `${baseUrl}${p2}`;
            const encoded = btoa(resourceUrl);
            return `${p1}="/stealth?url=${encoded}"`;
        });

        body += `
        <script>
        document.addEventListener('click', e => {
            let el = e.target.closest('a');
            if (el && el.getAttribute('href')) {
                e.preventDefault();
                let link = el.href;
                let encoded = btoa(encodeURIComponent(link));
                window.location.href = '/stealth?url=' + encoded;
            }
        });
        document.addEventListener('submit', e => {
            let form = e.target;
            if (form && form.action) {
                e.preventDefault();
                let action = form.action;
                let method = form.method || 'GET';
                if (method.toUpperCase() === 'GET') {
                    let params = new URLSearchParams(new FormData(form)).toString();
                    let url = action + (action.includes('?') ? '&' : '?') + params;
                    let encoded = btoa(encodeURIComponent(url));
                    window.location.href = '/stealth?url=' + encoded;
                } else {
                    fetch(action, {
                        method: method,
                        body: new FormData(form),
                        redirect: 'follow'
                    }).then(r => r.text()).then(t => {
                        document.open();
                        document.write(t);
                        document.close();
                    });
                }
            }
        });
        </script>
        `;

        res.send(body);
    } catch (err) {
        console.error('Error during fetch request:', err);
        return res.status(500).send('Error fetching the site');
    }
});

app.get('/stealth/resource', async (req, res) => {
    const encodedUrl = req.query.url;
    if (!encodedUrl) {
        return res.status(400).send('Missing URL');
    }

    let targetUrl;
    try {
        targetUrl = atob(encodedUrl);
        targetUrl = decodeURIComponent(targetUrl);
    } catch (err) {
        console.error('Error decoding URL:', err);
        return res.status(400).send('Invalid URL encoding');
    }

    try {
        const response = await fetch(targetUrl, { redirect: 'follow' });
        if (!response.ok) {
            console.error(`Failed to fetch resource. Status code: ${response.status}`);
            return res.status(500).send('Error fetching the resource');
        }

        const contentType = response.headers.get('Content-Type');
        res.setHeader('Content-Type', contentType);
        response.body.pipe(res);
    } catch (err) {
        console.error('Error during resource fetch:', err);
        return res.status(500).send('Error fetching the resource');
    }
});

app.listen(PORT, () => {
    console.log(\`stealth server running at http://localhost:\${PORT}\`);
});
