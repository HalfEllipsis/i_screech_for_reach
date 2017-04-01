from PIL import Image, ImageDraw, ImageFont
import json

with open("card_definitions.json") as cdef_file:
    cdef = json.load(cdef_file)

height = cdef['dimensions']['height']
width = cdef['dimensions']['width']

card = Image.open(cdef['card_stock']['file'])
card = card.crop([
    cdef['card_stock']['x_crop'],
    cdef['card_stock']['y_crop'],
    width,
    height])

card_cutout = Image.new("RGB",[width,height])
card_cutout_draw = ImageDraw.Draw(card_cutout)
mask_color = (255,255,255)


curve = cdef['dimensions']['curve']
card_cutout_draw.pieslice([0,0,curve-1,curve-1],
                          180,270, fill=mask_color)
card_cutout_draw.pieslice([width-curve,0,width-1,curve-1],
                          270,0, fill=mask_color)
card_cutout_draw.pieslice([0,height-curve,curve-1,height-1],
                          90,180, fill=mask_color)
card_cutout_draw.pieslice([width-curve,height-curve,width-1,height-1],
                          0,90, fill=mask_color)

card_cutout_draw.rectangle([curve/2,0,
                            width-curve/2-1,curve/2-1],
                          fill=mask_color)
card_cutout_draw.rectangle([0,curve/2,width-1,height-curve/2-1],
                           fill=mask_color)
card_cutout_draw.rectangle([curve/2,height-curve/2,width-curve/2-1,height],
                           fill=mask_color)

card_cutout.show()










