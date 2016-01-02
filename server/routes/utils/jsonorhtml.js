import accept from 'http-accept';


export default function jsonOrHtml(mwJson, mwHtml) {
    return (req, res, next) => {
        accept(req, res, () => {
            let type = req.accept.types.getBestMatch(['text/html', 'application/json']);
            if(type === 'text/html') {
                mwHtml(req, res, next);
            } else {
                mwJson(req, res, next);
            }
        });
    }
}