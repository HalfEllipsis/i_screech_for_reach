from PIL import Image, ImageDraw, ImageFont
import custom_geo
import tupleize
import json

opaque = (0,0,0,255)
translucence = (0,0,0,0)

with open("card_definitions.json") as cdef_file:
    cdef = json.load(cdef_file)
cdef = tupleize.tupleize(cdef)

number_of_cards = len(cdef['cards'])
total_size = (cdef['dimensions']['size'][0]*number_of_cards,cdef['dimensions']['size'][1])

card_stock = Image.open(cdef['card_stock']['file'])
card_stock = card_stock.crop(cdef['card_stock']['crop_offset']+cdef['dimensions']['size'])

card_cutout = custom_geo.gen_rounded_rectangle(cdef['dimensions']['size'],cdef['dimensions']['corner_round_radius'],'RGBA',opaque)

bg_image = Image.new('RGBA',cdef['dimensions']['size'],cdef['bg_color'])

for suit in cdef['suits'].keys():
        card_sheet_image = Image.new('RGBA',total_size,cdef['bg_color'])
        pip_image = Image.open(cdef['suits'][suit]['pip'])
        
        for card_index,card in enumerate(cdef['cards'].keys()):
            card_image = card_stock.copy()
            
            if cdef['cards'][card]['is_face']:
                face_image = Image.open(cdef['suits'][suit]['faces'][card]['image'])
                card_image.paste(face_image,box=(0,0),mask=face_image)
            else:#pip based image
                effective_locations = []
                for location in cdef['cards'][card]['pips']:
                    effective_locations.append(location)
                for mirror in cdef['cards'][card]['mirrors']:
                    new_locations = []
                    for location in effective_locations:
                        center_anchored_location = custom_geo.center_anchor(location,(1,1))
                        center_anchored_mirrored_location = custom_geo.mirror(center_anchored_location,mirror)
                        mirrored_location = custom_geo.center_unanchor(center_anchored_mirrored_location,(1,1))
                        if not custom_geo.too_close(location,mirrored_location,0.01):
                            new_locations.append(mirrored_location)
                    effective_locations.extend(new_locations)
                for location in effective_locations:
                    location_scaled = custom_geo.relative_location(location,card_image.size)
                    location_scaled_top_left = custom_geo.center_anchor(location_scaled,pip_image.size)
                    location_scaled_top_left_int = custom_geo.makeint(location_scaled_top_left)
                    card_image.paste(pip_image,box=location_scaled_top_left_int,mask=pip_image)
            
            logo_size = custom_geo.makeint(custom_geo.relative_size(cdef['logo']['size'],cdef['dimensions']['size']))
            logo_image = Image.new('RGBA',logo_size,translucence)
            logo_draw = ImageDraw.Draw(logo_image)
            
            logo_location = cdef['logo']['position']
            logo_location_center_anchored = custom_geo.center_anchor(logo_location,(1,1))
            logo_location_mirrored_center_anchored = custom_geo.mirror(logo_location_center_anchored,(1,-1))
            logo_location_mirrored = custom_geo.center_unanchor(logo_location_mirrored_center_anchored,(1,1))
            
            logo_location_scaled = custom_geo.relative_location(logo_location,cdef['dimensions']['size'])
            logo_location_scaled_top_left = custom_geo.center_anchor(logo_location_scaled,logo_size)
            logo_location_scaled_top_left_int = custom_geo.makeint(logo_location_scaled_top_left)
            
            logo_location_mirrored_scaled = custom_geo.relative_location(logo_location_mirrored,cdef['dimensions']['size'])
            logo_location_mirrored_scaled_top_left = custom_geo.center_anchor(logo_location_mirrored_scaled,logo_size)
            logo_location_mirrored_scaled_top_left_int = custom_geo.makeint(logo_location_mirrored_scaled_top_left)            
            
            font_height = logo_size[1]*cdef['logo']['text']['size']
            font_position = custom_geo.makeint(custom_geo.relative_location(cdef['logo']['text']['position'],logo_size))
            font_color = cdef['suits'][suit]['text_color']
            font = ImageFont.truetype(cdef['logo']['text']['font'],round(font_height))
            
            logo_symbol = Image.open(cdef['suits'][suit]['logo_symbol'])
            logo_symbol_size = custom_geo.makeint(custom_geo.fit_size(logo_symbol.size,logo_size,cdef['logo']['symbol']['size']))
            logo_symbol_resized = logo_symbol.resize(logo_symbol_size,resample=Image.LANCZOS)
            logo_symbol_position =  custom_geo.relative_location(cdef['logo']['symbol']['position'],logo_symbol_size)
            logo_symbol_position_top_left = custom_geo.makeint(custom_geo.center_anchor(logo_symbol_position,logo_symbol_resized.size))
            
            logo_image.paste(logo_symbol_resized,box=logo_symbol_position_top_left,mask=logo_symbol_resized)
            logo_draw.text(font_position,card,font=font,fill=font_color)
            logo_image_flipped = logo_image.transpose(Image.ROTATE_180)
            
            card_image.paste(logo_image,box=logo_location_scaled_top_left_int,mask=logo_image)
            card_image.paste(logo_image_flipped,box=logo_location_mirrored_scaled_top_left_int,mask=logo_image_flipped)    
                 
            finished_card_image = Image.composite(card_image,bg_image,card_cutout)
            location_in_sheet = (card_index*card_stock.size[0],0)
            card_sheet_image.paste(finished_card_image,box=location_in_sheet,mask=finished_card_image)
        card_sheet_image.show()















