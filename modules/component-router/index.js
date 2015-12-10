import element from 'virtual-element';
import pathToRegexp from 'path-to-regexp';


export function renderRoutes(path, routes) {
    return Object.keys(routes).map(routePath => {
        let paramsInfo = [];
        let re = pathToRegexp(routePath, paramsInfo);
        let paramNames = paramsInfo.map(p => p.name);
        
        let match = re.exec(path);
        if(match) {
            let Component = routes[routePath];
            let params = pairsToObj(zip(paramNames, match.slice(1)));
            return <Component params={params} />
        } else {
            return <noscript/>;
        }
    });
}

function zip(a1, a2) {
    return a1.map((v, i) => [v, a2[i]]);
}

function pairsToObj(arr) {
    let o = {};
    arr.forEach(pair => {
        o[pair[0]] = pair[1]
    });
    return o;
}