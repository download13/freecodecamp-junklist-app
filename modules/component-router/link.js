import element from 'virtual-element';

import styles from './link.css';


export default ({
    props: {
        href,
        updatePath,
        class: className,
        children
    }
}) => {
    let onClick = e => {
        e.preventDefault();
        updatePath(href);
    };
    
    return <a class={className} href={href} onClick={onClick}>{children}</a>;
};