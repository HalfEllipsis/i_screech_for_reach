from PIL import Image, ImageDraw
import math

def corners(parent_size,size,left_flag,top_flag):
    if left_flag:
        x1 = 0
        x2 = size[0]-1
    else:
        x1 = parent_size[0]-size[1]
        x2 = parent_size[0]-1
    if top_flag:
        y1 = 0
        y2 = size[1]-1;
    else:
        y1 = parent_size[1]-size[1]
        y2 = parent_size[1]-1
    return [(x1,y1),(x2,y2)]

def tupmap(function,*tuples):
    return tuple(map(function,*tuples))

def makeint(location):
    return tupmap(int,location)

def relative_location(location,reference_size):
    return tupmap(lambda a,b:a*b,location,reference_size)

def relative_size(size,reference_size):
    return relative_location(size,reference_size)

def fit_size(size,reference_size,reference_scale):
    scales = tupmap(lambda a,b:b*reference_scale/a,size,reference_size)
    scale_to_fit = min(scales)
    return tupmap(lambda a:a*scale_to_fit,size)

def center_anchor(location,reference_size):
    return tupmap(lambda a,b:a-b/2,location,reference_size)

def center_unanchor(location,reference_size):
    return tupmap(lambda a,b:a+b/2,location,reference_size)

def mirror(location,mirror_direction):
    mirror_mag = math.sqrt(sum(tupmap(lambda a:a*a,mirror_direction)))
    unit_mirror = tupmap(lambda a:a/mirror_mag,mirror_direction)
    dot_product = sum(tupmap(lambda a,b:a*b,location,unit_mirror))
    projection = tupmap(lambda a:a*dot_product,unit_mirror)
    complement = tupmap(lambda a,b:a-b,location,projection)
    return tupmap(lambda a,b:a-2*b,location,complement)

def gen_rounded_rectangle(size,radius,color_mode="RGBA",color=(255,255,255)):
    axes = (radius*2,radius*2)
    result = Image.new(color_mode,size)
    draw = ImageDraw.Draw(result)
    draw.pieslice(corners(size,axes, True, True),180,270, fill=color)
    draw.pieslice(corners(size,axes,False, True),270,  0, fill=color)
    draw.pieslice(corners(size,axes, True,False), 90,180, fill=color)
    draw.pieslice(corners(size,axes,False,False),  0, 90, fill=color)

    draw.rectangle([radius,0,size[0]-radius-1,radius-1],fill=color)
    draw.rectangle([0,radius,size[0]-1,size[1]-radius-1],fill=color)
    draw.rectangle([radius,size[1]-radius,size[0]-radius-1,size[1]],fill=color)
    return result

def too_close(locationA,locationB,tolerance):
    distance_sqrd = sum(tupmap(lambda a,b:(a-b)**2,locationA,locationB))
    return distance_sqrd <= (tolerance**2)


