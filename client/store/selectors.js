import {createSelector} from 'reselect';


const
    items = state => state.items,
    token = state => state.auth.token,
    path = state => state.routing.path,
    user = state => state.auth.user,
    loggedIn = createSelector(
        user,
        user => !!user
    ),
    userItems = state => state.userItems,
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
    incomingRequests = state => state.incomingRequests,
    sentRequests = state => state.sentRequests,
    viewItemRequested = createSelector(
        viewItem,
        sentRequests,
        (item, requests) => {
            if(item) {
                return requests.some((req => req.item === item.id));
            }
        }
    ),
    viewItemRequestAccepted = createSelector(
        viewItem,
        sentRequests,
        (item, requests) => {
            if(item) {
                let request = requests.find(req => req.item === item.id);
                if(request) {
                    return request.accepted;
                }
            }
        }
    ),
    viewItemOwned = createSelector(
        viewItem,
        user,
        (item, user) => {
            return item && user && item.owner === user.id;
        }
    ),
    viewItemRequests = state => state.viewItemRequests,
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
                image: cachedProperty('image', cachedItem, item),
                city: cachedProperty('city', cachedItem, item),
                text: cachedProperty('text', cachedItem, item)
            };
        }
    ),
    editImageStatus = state => state.editImageUpload
;


export {
    path,
    user,
    loggedIn,
    token,
    frontPageItems,
    userItems,
    sentRequests,
    incomingRequests,
    viewItemId,
    viewItem,
    viewItemRequested,
    viewItemRequestAccepted,
    viewItemOwned,
    viewItemRequests,
    editItem,
    editImageStatus
};


function cachedProperty(name, cache, canonical) {
    let cacheVal = cache[name];
    
    if(cacheVal || cacheVal === '') return cacheVal;
    return canonical[name];
}