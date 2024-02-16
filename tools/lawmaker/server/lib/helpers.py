import cv2
import math
import sys
import base64
from configdata import status
from string import Template
import random 
import mediapipe as mp
import numpy as np

# Defined the model files
FACE_PROTO = "lib/weights/opencv_face_detector.pbtxt"
FACE_MODEL = "lib/weights/opencv_face_detector_uint8.pb"

AGE_PROTO = "lib/weights/age_deploy.prototxt"
AGE_MODEL = "lib/weights/age_net.caffemodel"

GENDER_PROTO = "lib/weights/gender_deploy.prototxt"
GENDER_MODEL = "lib/weights/gender_net.caffemodel"

# Load network
FACE_NET = cv2.dnn.readNet(FACE_MODEL, FACE_PROTO)
AGE_NET = cv2.dnn.readNet(AGE_MODEL, AGE_PROTO)
GENDER_NET = cv2.dnn.readNet(GENDER_MODEL, GENDER_PROTO)

MODEL_MEAN_VALUES = (78.4263377603, 87.7689143744, 114.895847746)
# AGE_LIST = ["(0-2)", "(4-6)", "(8-12)", "(15-20)", "(25-32)", "(38-43)", "(48-53)", "(60-100)"]
AGE_LIST = [1, 5, 10, 18, 27, 41, 49, 65]
GENDER_LIST = ["male", "female"]

box_padding = 20

def get_face_box (net, frame, conf_threshold = 0.7):
  frame_copy = frame.copy()
  frame_height = frame_copy.shape[0]
  frame_width = frame_copy.shape[1]
  blob = cv2.dnn.blobFromImage(frame_copy, 1.0, (300, 300), [104, 117, 123], True, False)

  net.setInput(blob)
  detections = net.forward()
  boxes = []

  for i in range(detections.shape[2]):
    confidence = detections[0, 0, i, 2]

    if confidence > conf_threshold:
      x1 = int(detections[0, 0, i, 3] * frame_width)
      y1 = int(detections[0, 0, i, 4] * frame_height)
      x2 = int(detections[0, 0, i, 5] * frame_width)
      y2 = int(detections[0, 0, i, 6] * frame_height)
      boxes.append([x1, y1, x2, y2])
      cv2.rectangle(frame_copy, (x1, y1), (x2, y2), (0, 255, 0), int(round(frame_height / 150)), 8)

  return frame_copy, boxes


def age_gender_detector (input_path, sizex,sizey):
    image = cv2.imread(input_path)
    resized_image = cv2.resize(image, (sizex, sizey))
    frame = resized_image.copy()
    frame_face, boxes = get_face_box(FACE_NET, frame)
    if len(boxes) > 0:
        box = boxes[0] # in boxes:  
        #IndexError: list index out of range?
        face = frame[max(0, box[1] - box_padding):min(box[3] + box_padding, frame.shape[0] - 1), \
            max(0, box[0] - box_padding):min(box[2] + box_padding, frame.shape[1] - 1)]

        blob = cv2.dnn.blobFromImage(face, 1.0, (227, 227), MODEL_MEAN_VALUES, swapRB = False)
        GENDER_NET.setInput(blob)
        gender_predictions = GENDER_NET.forward()
        gender = GENDER_LIST[gender_predictions[0].argmax()]
        # print("Gender: {}, conf: {:.3f}".format(gender, gender_predictions[0].max()))

        AGE_NET.setInput(blob)
        age_predictions = AGE_NET.forward()
        age = AGE_LIST[age_predictions[0].argmax()]
        # print("Age: {}, conf: {:.3f}".format(age, age_predictions[0].max()))
    else:
        age =25
        gender = "female"
    return age, gender



def encode_file_to_base64(path):
    with open(path, 'rb') as file:
        return base64.b64encode(file.read()).decode('utf-8')
    
def decode_and_save_base64(base64_str, save_path):
    if base64_str.startswith("data:image/png;base64,"):
        b64 = base64_str[len("data:image/png;base64,"):]
    else: 
        b64 =  base64_str  # or whatever
    with open(save_path, "wb") as file:
        file.write(base64.b64decode(b64))




def getLawPosePrompt(age, gender):
    global status
    if age == None: age = 25
    if gender == None: gender = "female"
    randomlaw = random.choice(status["apps"]["lawmaker"]["laws"])
    tempprompt = Template(randomlaw["prompt"])
    prompt = tempprompt.substitute(age=str(age), gender=gender)
    law = randomlaw["law"]
    pose = randomlaw["pose"]
    negative_prompt = randomlaw["negative_prompt"]
    return law,pose,prompt, negative_prompt




############## faceswapping mediapipe 
#copy-paste from github page

mp_drawing = mp.solutions.drawing_utils
mp_face_mesh = mp.solutions.face_mesh

mouth_landmark_index=[13,312,311,310,415,308,324,318,402,317,14,87,178,88,95,78, 191, 80, 81, 82]


def get_face_landmark(img):
	with mp_face_mesh.FaceMesh(static_image_mode = True,	 
								refine_landmarks=True,
								max_num_faces=1) as face_mesh:
		results= face_mesh.process(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
		if results.multi_face_landmarks is None:
			return None
		if len(results.multi_face_landmarks) > 1:
			print("There are too much face")

		xyz_landmark_points=[]
		landmark_points= []

		face_landmark= results.multi_face_landmarks[0].landmark
		for landmark in face_landmark:
			x = landmark.x
			y = landmark.y
			z = landmark.z
			relative_x=int(x * img.shape[1])
			relative_y=int(y * img.shape[0])
			#cv2.circle(img, (relative_x,relative_y) , 3, (255,255,255), -1)
			xyz_landmark_points.append((x, y, z))
			landmark_points.append((relative_x,relative_y))

	return xyz_landmark_points, landmark_points

def get_iris_landmark(landmark_points, return_xyz=True, location= "Left"):
	points= []
	if location == 'Left':
		iris_landmark_index= mp_face_mesh.FACEMESH_LEFT_IRIS
	else:
		iris_landmark_index= mp_face_mesh.FACEMESH_RIGHT_IRIS
	for idx, _ in iris_landmark_index:
		source = landmark_points[idx]
		if return_xyz:
			relative_source = [[source[0], source[1], source[2]]]
		else: 
			relative_source = [[int(source[0]), int(source[1])]]
		points.append(relative_source)
	return np.array(points)

def get_eye_landmark(landmark_points, location='Left'):
	points= []
	if location == 'Left':
		eye_landmark_index= mp_face_mesh.FACEMESH_LEFT_EYE
	else:
		
		eye_landmark_index= mp_face_mesh.FACEMESH_RIGHT_EYE
	for idx, _ in eye_landmark_index:
		source = landmark_points[idx]
		relative_source = [[int(source[0]), int(source[1])]]
		points.append(relative_source)
	return np.array(points)

def get_mouth_landmark(landmark_points):
	points= []
	for idx in mouth_landmark_index:
		source = landmark_points[idx]
		relative_source = [[int(source[0]), int(source[1])]]
		points.append(relative_source)
	return np.array(points)

def protected(mask, landmark_points):
	convexhull_landmark_points= cv2.convexHull(landmark_points)
	mask=cv2.fillConvexPoly(mask, np.array(convexhull_landmark_points), 0)
	return mask

def create_face_mask(img, img_convexhull, img_landmark_points, protected_eyes= False, protected_mouth= False):
	face_mask = np.zeros(img.shape[:2])
	face_mask = cv2.fillConvexPoly(face_mask, img_convexhull, 255)
	if protected_eyes:
		face_mask = protected(face_mask, get_eye_landmark(img_landmark_points))
		face_mask = protected(face_mask, get_eye_landmark(img_landmark_points, location="Right"))
	if protected_mouth:
		face_mask = protected(face_mask, get_mouth_landmark(img_landmark_points))
	return face_mask.astype(np.uint8)

def find_nearest_above(my_array, target):
    diff = my_array - target
    mask = np.ma.less_equal(diff, -1)
    # We need to mask the negative differences
    # since we are looking for values above
    if np.all(mask):
        c = np.abs(diff).argmin()
        return c # returns min index of the nearest if target is greater than any value
    masked_diff = np.ma.masked_array(diff, mask)
    return masked_diff.argmin()
def hist_match(original, specified):
    oldshape = original.shape
    original = original.ravel()
    specified = specified.ravel()

    # get the set of unique pixel values and their corresponding indices and counts
    s_values, bin_idx, s_counts = np.unique(original, return_inverse=True,return_counts=True)
    t_values, t_counts = np.unique(specified, return_counts=True)

    # Calculate s_k for original image
    s_quantiles = np.cumsum(s_counts).astype(np.float64)
    s_quantiles /= s_quantiles[-1]
    
    # Calculate s_k for specified image
    t_quantiles = np.cumsum(t_counts).astype(np.float64)
    t_quantiles /= t_quantiles[-1]

    # Round the values
    sour = np.around(s_quantiles*255)
    temp = np.around(t_quantiles*255)
    
    # Map the rounded values
    b=[]
    for data in sour[:]:
        b.append(find_nearest_above(temp,data))
    b= np.array(b,dtype='uint8')

    return b[bin_idx].reshape(oldshape)

def blend_with_mask_matrix(src1, src2, mask):
    res_channels = []
    for c in range(0, src1.shape[2]):
        a = src1[:, :, c]
        b = src2[:, :, c]
        m = mask[:, :]
        #Alpha blending
        res = cv2.add(
            cv2.multiply(b, cv2.divide(np.full_like(m, 255) - m, 255.0, dtype=cv2.CV_32F), dtype=cv2.CV_32F),
            cv2.multiply(a, cv2.divide(m, 255.0, dtype=cv2.CV_32F), dtype=cv2.CV_32F),
           dtype=cv2.CV_8U)
        res_channels += [res]
    res = cv2.merge(res_channels)
    return res


def extract_frame_from_video(path):
	"""
	:param path: path to the video
	return: list of numpy array video frame
	"""
	vid = cv2.VideoCapture(path)
	count = 0
	ret =1 
	frames=[]
	while ret:
		ret,frame = vid.read()
		if frame is not None and len(frame)>0:
			frames.append(frame)
			count = count + 1
	print(f"Extract total {count} frames from video")
	return frames

def apply_mask(img, mask):
	"""
	:param img: max 3 channel image
	:param mask: [0-255] values in mask
	return: image with mask apply
	"""
	masked_img= cv2.bitwise_and(img, img, mask=mask)
	return masked_img

def get_point_index(point, landmark_points):
	# return: the index of the point in the list
	return landmark_points.index(point)

def get_visuable_landmark(convexHull, landmark_points, xyz_landmark_points):
    """
    :param convexHull: convexhull of points
    :param landmark_points: points in uv_dimensional
    :param xyz_landmark_points: points in xyz_dimensional
    return mask matrix
    """
    #get z_coordination of convexHull 
    z=[]
    for point in convexHull:   
        indx=get_point_index(tuple(point[0]), landmark_points)
        z.append(xyz_landmark_points[indx][2])
    
    visuable= np.ones(len(xyz_landmark_points), dtype=bool)
    #filter the hidden landmark 
    for idx, landmark in enumerate(xyz_landmark_points):
        if landmark[2] > np.max(z):
            visuable[idx]=False
    return visuable

def get_triangles(convexhull, landmarks_points, xyz_landmark_points):
	rect= cv2.boundingRect(convexhull)
	subdiv= cv2.Subdiv2D(rect)
	visuable=get_visuable_landmark(convexhull, landmarks_points, xyz_landmark_points)
	facial_landmarks= [point for idx, point in enumerate(landmarks_points) if visuable[idx]==1]
	subdiv.insert(facial_landmarks)
	triangles= subdiv.getTriangleList()
	triangles= np.array(triangles, np.int32)
	index_points_triangles= []

	for tri in triangles:
		pt1= (tri[0], tri[1])
		pt2= (tri[2], tri[3])
		pt3= (tri[4], tri[5])

		index_pt1=get_point_index(pt1, landmarks_points)
		index_pt2=get_point_index(pt2, landmarks_points)
		index_pt3=get_point_index(pt3, landmarks_points)

		triangle = [index_pt1, index_pt2, index_pt3]
		index_points_triangles.append(triangle)
	return index_points_triangles

def triangulation(triangle_point_index, landmark_points, img= None):
		#get triangluation point
		pt1= landmark_points[triangle_point_index[0]]
		pt2= landmark_points[triangle_point_index[1]]
		pt3= landmark_points[triangle_point_index[2]]

		triangle=np.array([pt1, pt2, pt3])
		rect= cv2.boundingRect(triangle)

		(x, y, w, h) = rect

		cropped_triangle = None

		if img is not None:
			cropped_triangle= img[y:y+h, x:x+w]

		cropped_triangle_mask= np.zeros((h,w), np.uint8)

		points=np.array([[pt1[0] - x, pt1[1] - y],
						 [pt2[0] - x, pt2[1] - y],
						 [pt3[0] - x, pt3[1] - y]])

		cv2.fillConvexPoly(cropped_triangle_mask, points, 255)

		return points, cropped_triangle, cropped_triangle_mask, rect

def warp_triangle(points_target, points_dest, cropped_triangle_target, cropped_triangle_mask_dest, rect):
	
	(x, y, w, h) = rect
	M = cv2.getAffineTransform(np.float32(points_target),np.float32(points_dest))
	warped_triangle= cv2.warpAffine(cropped_triangle_target, M, (w,h))
	warped_triangle= apply_mask(warped_triangle, cropped_triangle_mask_dest)
	return warped_triangle.astype(np.uint8)

def getCenter(convexHull_points):
	"""
	return: the centre point of convexHull
	"""
	x1, y1, w1, h1 = cv2.boundingRect(convexHull_points)
	center = ((x1 + int(w1 / 2), y1 + int(h1 / 2)))
	#bounding_rectangle = cv2.rectangle(face2.copy(), (x1, y1), (x1 + w1, y1 + h1), (0, 255, 0), 2)
	return center

def getCenter_xyz(points):
	"""
	return: the centre point of each points in xyz_dimensional
	"""
	return np.mean(points,axis=0)

def AngleOfDepression(pointA, pointB):
	"""
	:point: in xyz_dimensional
	return: angle of 2 point. Its real part is in [-pi/2, pi/2]
	"""
	(xA, yA, zA)= pointA
	(xB, yB, zB)= pointB
	horizontal_dist = np.linalg.norm(np.array(xA,yA) - np.array(xB, yB))
	vertizontal_dist= zA- zB
	
	return np.arctan(vertizontal_dist/horizontal_dist) 



def face_swapping(dest_img, dest_landmark_points, dest_xyz_landmark_points, dest_convexhull, target_img, target_landmark_points, target_convexhull, return_face=False):
	new_face = np.zeros_like(dest_img, np.uint8)

	for triangle_index in get_triangles(dest_convexhull, dest_landmark_points, dest_xyz_landmark_points):
	
		points_dest, _ ,cropped_triangle_mask_dest, rect =triangulation(triangle_index, dest_landmark_points)


		points_target, cropped_triangle_target, cropped_triangle_mask_target, _ =triangulation(triangle_index, target_landmark_points, target_img)

		#warp triangles
		warped_triangle = warp_triangle(points_target, points_dest, cropped_triangle_target, cropped_triangle_mask_dest, rect)
		(x, y, w, h)= rect

		triangle_area= new_face[y: y + h, x: x + w]

		#remove the line between the triangles
		triangle_area_gray = cv2.cvtColor(triangle_area, cv2.COLOR_BGR2GRAY)
		_, mask_triangles_designed = cv2.threshold(triangle_area_gray, 1, 255, cv2.THRESH_BINARY_INV)
		warped_triangle = apply_mask(warped_triangle, mask_triangles_designed)
		triangle_area= cv2.add(triangle_area, warped_triangle)

		new_face[y: y + h, x: x + w]= triangle_area

	dest_mask = create_face_mask(dest_img, dest_convexhull, dest_landmark_points, protected_eyes=True, protected_mouth=True)
	dest_without_face= apply_mask(dest_img, cv2.bitwise_not(dest_mask))

	#smoothing new face
	new_face = cv2.medianBlur(new_face, 3)

	new_face= apply_mask(new_face, dest_mask)

	old_face= apply_mask(dest_img, dest_mask)
	blending_mask= create_face_mask(dest_img, dest_convexhull, dest_landmark_points)

	cv2.GaussianBlur(blending_mask, (51, 51), 30, dst=blending_mask)
	blending_mask = apply_mask(blending_mask, dest_mask)
	target_face= blend_with_mask_matrix(new_face, old_face, blending_mask)

	result = cv2.add(dest_without_face, target_face)
	result=cv2.seamlessClone(result, dest_img, blending_mask, getCenter(dest_convexhull), cv2.NORMAL_CLONE)
	if return_face:
		return target_face, result
	return result





def faceswap(dest_img_path, target_img_path, result_path='result.jpg'):
	dest_img=cv2.imread(dest_img_path)
	target_img= cv2.imread(target_img_path)

	dest_xyz_landmark_points, dest_landmark_points= get_face_landmark(dest_img)
	dest_convexhull= cv2.convexHull(np.array(dest_landmark_points))

	target_img_hist_match=hist_match(target_img,dest_img)
	
	_, target_landmark_points= get_face_landmark(target_img)
	target_convexhull= cv2.convexHull(np.array(target_landmark_points))

	new_face, result= face_swapping(dest_img, dest_landmark_points, dest_xyz_landmark_points, dest_convexhull, target_img, target_landmark_points, target_convexhull, return_face= True)

	height, width, _ = dest_img.shape
	h, w, _ = target_img.shape
	rate= width/w
	# cv2.imshow("Destination image", dest_img)
	# cv2.imshow("Target image", cv2.resize(target_img, (int(w * rate), int(h * rate))))
	# cv2.imshow("New face", new_face)
	# cv2.imshow("Result", result)
	cv2.imwrite(result_path, result)
	# cv2.waitKey(0)
	