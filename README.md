Coding Academy - production ready server 

<!-- remove item form trans -->

db.collectionName.updateOne(
    { _id: ObjectId("66dfe8806c4093e91bca3d48") },
    { $unset: { "foodlist.[item-name]": "" } }
)

<!-- add item to trans -->
db.collectionName.updateOne(
    { _id: ObjectId("66dfe8806c4093e91bca3d48") },
    { $set: { "foodlist.side-dish": {
          he: 'מנות צד',
          es: 'Guarniciones',
          en: 'Side dish'
    } } }
    
)

