export default function serveApp(req, res) {
    res.sendFile('index.html', {root: 'dist/public'});
}
