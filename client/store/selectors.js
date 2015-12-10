import {createSelector} from 'reselect';


const
    items = state => state.items,
    token = state => state.auth.token,
    path = state => state.routing.path,
    user = state => state.auth.user,
    frontPageItemIds = state => state.frontPageItemIds,
    frontPageItems = createSelector(
        frontPageItemIds,
        items,
        (ids, items) => ids.map(id => items[id])
    ),
    viewItemId = state => state.viewItemId,
    viewItem = createSelector(
        viewItemId,
        items,
        (id, items) => items[id]
    ),
    requestedItemIds = state => state.userRequestedItemIds,
    viewItemRequested = createSelector(
        viewItem,
        requestedItemIds,
        (item, ids) => {
            if(item) {
                return ids.indexOf(item.id) !== -1;
            }
        }
    ),
    viewItemOwned = createSelector(
        viewItem,
        user,
        (item, user) => {
            if(item) {
                return item.owner === user.id;
            }
        }
    ),
    editItemId = state => state.editItemId,
    editItemCache = state => state.editItemCache,
    editItem = createSelector(
        editItemCache,
        editItemId,
        items,
        (cachedItem, id, items) => {
            let item = items[id] || {};
            
            return {
                description: cachedProperty('description', cachedItem, item),
                imageUrl: cachedProperty('imageUrl', cachedItem, item),
                city: cachedProperty('city', cachedItem, item),
                text: cachedProperty('text', cachedItem, item)
            };
        }
    )
;


export {
    path,
    user,
    frontPageItems,
    viewItem,
    viewItemRequested,
    viewItemOwned,
    editItem
};


function cachedProperty(name, cache, canonical) {
    let cacheVal = cache[name];
    
    if(cacheVal || cacheVal === '') return cacheVal;
    return canonical[name];
}