from bson.objectid import ObjectId
import pymongo
import json

db = pymongo.MongoClient("mongodb://127.0.0.1:27017")["ofoten_lokalmat"]

"""
# EXPORT DATA:

data = {}
for coll_name in db.list_collection_names():
    coll = db.get_collection(coll_name)
    data[coll_name] = [{key: value for key, value in o.items() if not isinstance(value, ObjectId)} for o in coll.find({})]

print(json.dumps(data))

"""

"""
#IMPORT DATA (untested):

data = {"produkter": [{"navn": "reker", "pris": {"valutta": "kr", "enhet": "kg", "mengde": 250}, "bilde": "https://bilder.ngdata.no/1893/meny/medium.jpg"}, {"navn": "bl\u00e5skjell", "pris": {"valutta": "kr", "enhet": "kg", "mengde": "50"}, "bilde": "https://bilder.ngdata.no/1990/meny/medium.jpg"}], "users": []}

for coll_name, values in data.items():
    coll = db.get_collection(coll_name)
    coll.insert_many(values)

"""
