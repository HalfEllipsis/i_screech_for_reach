from PIL import Image, ImageDraw, ImageFont
import custom_geo
import tupleize
import json

with open("card_definitions.json") as cdef_file:
    cdef = json.load(cdef_file)
cdef = tupleize.tupleize(cdef)

number_of_cards = len(cdef['cards'])
total_size = (cdef['dimensions']['size'][0]*number_of_cards,cdef['dimensions']['size'][1])

card_stock = Image.open(cdef['card_stock']['file'])
card_stock = card_stock.crop(cdef['card_stock']['crop_offset']+cdef['dimensions']['size'])

card_cutout = custom_geo.gen_rounded_rectangle(cdef['dimensions']['size'],cdef['dimensions']['radius'],'RGBA',(0,0,0,255))

bg_image = Image.new('RGBA',cdef['dimensions']['size'],cdef['bg_color'])

for suit in cdef['suits'].keys():
        card_sheet_image = Image.new('RGBA',total_size,cdef['bg_color'])
        pip_image = Image.open(cdef['suits'][suit]['pip'])
        
        for card in cdef['cards'].keys():
            card_image = card_stock.copy()
            effective_locations = []
            for location in cdef['cards'][card]['pips']:
                effective_locations.append(location)
                for mirror in cdef['cards'][card]['mirrors']:
                    center_anchored_location = custom_geo.center_anchor(location,(1,1))
                    center_anchored_mirrored_location = custom_geo.mirror(center_anchored_location,mirror)
                    mirrored_location = custom_geo.center_unanchor(center_anchored_mirrored_location,(1,1))
                    effective_locations.append(mirrored_location) 
            for location in effective_locations:
                location_scaled = custom_geo.center_anchor(custom_geo.relative_location(location,card_image.size),pip_image.size)
                location_scaled_int = custom_geo.makeint(location_scaled)
                card_image.paste(pip_image,box=location_scaled_int,mask=pip_image)
                    
            finished_card_image = Image.composite(card_image,bg_image,card_cutout)
            finished_card_image.show()















