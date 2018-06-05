from flask import *
from dbModel import *
import math


app = Flask(__name__)


@app.route("/index")
@app.route("/")
def index():
    return render_template('mapbox_index.html')


@app.route('/position', methods=['GET'])
def position():
    longLat = readConfig()
    # Update Position
    obj = {'geometry': {'type': 'MultiPoint',
                        'coordinates': [[-73.87227, 40.7750943], [-73.87315, 40.7750943], [-73.872637, 40.7750943], [-73.8728, 40.7750943]]},
           'type': 'Feature', 'properties': {}}

    obj = update_position(obj, longLat)
    return jsonify(obj)


# ReadConfig for Longitude and Latitude
def readConfig():
    lat = long = ''
    try:
        with open('config.txt', 'r') as config:
            for lineConfig in config:

                if 'lat' in lineConfig:
                    lat = lineConfig[lineConfig.index('=') + 1: lineConfig.index('\n')]
                if 'long' in lineConfig:
                    long = lineConfig[lineConfig.index('=') + 1: lineConfig.index('\n')]
        return {"lat": float(lat), "long": float(long)}
    finally:
        config.close()


# Update Object Position
def update_position(obj, longLat):
    lat_long = xyz_pos_to_geo(
        longLat['long'], longLat['lat'], 0,
        1.5, 1.5, 3)

    # update longitude and latitude
    obj.get('geometry').get('coordinates')[0] = [lat_long["lat"], lat_long["long"]]
    # obj.get('geometry').get('coordinates')[1] = lat_long["long"]

    return obj


# Functions for Calculating Position from "qguard_geolocation_translator"
#==========================================================#
# [Convert to Radians - deg_to_rad]
#
#  This function converts incoming degrees to radians
#
# [Inputs]
#  Number - deg:
#   The value to be converted
#
# [Output]
#  Float:
#   The incoming value in degrees converted to radians
#==========================================================#

def deg_to_rad(deg):
  return (float(deg) * (math.pi / 180.0))

#==========================================================#
# [Convert to Degrees - rad_to_deg]
#  This function converts incoming radians to degrees
#
# [Inputs]
#  Number - rad:
#   The value to be converted
#
# [Output]
#  Float:
#   The incoming value in degrees converted to degrees
#==========================================================#

def rad_to_deg(rad):
  return (float(rad) * (180.0 / math.pi))


#======================================================#
#  This method appends geographic coordinates to the
#  "position" dictionary and the track and speed to
#  the "velocity" dictionary for each object in the
#  object list
#======================================================#
def xyz_pos_to_geo(
        origin_lat,
        origin_long,
        origin_bearing,
        x,
        y,
        z):
    distance = math.sqrt(x * x + y * y + z * z)
    earth_radius = 6371000.0
    angular_distance = distance / earth_radius
    bearing_offset = deg_to_rad(origin_bearing)
    lat1 = deg_to_rad(origin_lat)
    long1 = deg_to_rad(origin_long)
    bearing = bearing_offset + math.atan2(y, x)

    lat2 = math.asin((math.sin(lat1) *
                      math.cos(angular_distance)) +
                     (math.cos(lat1) *
                      math.sin(angular_distance) *
                      math.cos(bearing)))

    long2_y = (math.sin(bearing) *
               math.sin(angular_distance) *
               math.cos(lat1))
    long2_x = (math.cos(angular_distance) -
               (math.sin(lat1) *
                math.sin(lat2)))
    long2 = (long1 +
             math.atan2(long2_y, long2_x))
    lat2 = rad_to_deg(lat2)
    long2 = rad_to_deg(long2)

    return {"lat": lat2, "long": long2}


# Main Function
if __name__ == '__main__':
    # Run Application
    app.run(debug=True)


# #Ajax Method
# @app.route("/api", methods=['POST'])
# def api():
#     db_data = MapPets.query.all()
#     infornation_dic = {}
#     infornation_list = []
#     for data in db_data:
#         infornation_dic['data'] = []
#         infornation_dic['Name'] = data.Name
#         infornation_dic['Picture'] = data.Picture
#         infornation_dic['Color'] = data.Color
#         infornation_dic['Longitude'] = data.Longitude
#         infornation_dic['Latitude'] = data.Latitude
#         infornation_list.append(infornation_dic)
#         infornation_dic = {}
#     return json.dumps(infornation_list)