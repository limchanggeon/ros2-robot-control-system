import sys
import threading
from PyQt5.QtWidgets import QApplication, QMainWindow, QLabel, QWidget, QVBoxLayout
from PyQt5.QtCore import QThread, QObject, pyqtSignal, pyqtSlot
from PyQt5.QtGui import QPixmap, QImage, QPainter, QTransform
import rclpy
from rclpy.node import Node
from nav_msgs.msg import OccupancyGrid
from tf2_ros import TransformException
from tf2_ros.buffer import Buffer
from tf2_ros.transform_listener import TransformListener
import numpy as np
import math

# ROS 노드를 실행할 워커 클래스
class RosNodeWorker(QObject):
    # PyQt 시그널 정의
    map_updated = pyqtSignal(object)
    robot_pose_updated = pyqtSignal(float, float, float)

    def __init__(self):
        super().__init__()
        self.node = None
        self.tf_buffer = None
        self.tf_listener = None

    def run(self):
        """ROS 노드를 초기화하고 스핀을 시작하는 메인 함수"""
        rclpy.init()
        self.node = Node('gui_node')
        
        # TF 리스너 초기화
        self.tf_buffer = Buffer()
        self.tf_listener = TransformListener(self.tf_buffer, self.node)

        # 맵 토픽 구독자 생성
        self.node.create_subscription(
            OccupancyGrid,
            '/map',
            self.map_callback,
            rclpy.qos.QoSProfile(depth=1, reliability=rclpy.qos.ReliabilityPolicy.RELIABLE, durability=rclpy.qos.DurabilityPolicy.TRANSIENT_LOCAL)
        )
        
        # TF 조회를 위한 타이머 설정
        self.node.create_timer(0.1, self.tf_lookup_timer)

        self.node.get_logger().info("ROS Node Worker is running...")
        rclpy.spin(self.node)
        
        # 종료 처리
        self.node.destroy_node()
        rclpy.shutdown()

    def map_callback(self, msg):
        """맵 데이터를 받으면 시그널을 발생시키는 콜백"""
        self.map_updated.emit(msg)

    def tf_lookup_timer(self):
        """주기적으로 map -> base_link 변환을 조회하고 시그널 발생"""
        try:
            trans = self.tf_buffer.lookup_transform('map', 'base_link', rclpy.time.Time())
            t = trans.transform.translation
            q = trans.transform.rotation
            
            # 쿼터니언을 오일러 각(yaw)으로 변환
            yaw = math.atan2(2.0 * (q.w * q.z + q.x * q.y), 1.0 - 2.0 * (q.y * q.y + q.z * q.z))
            
            self.robot_pose_updated.emit(t.x, t.y, yaw)
        except TransformException as ex:
            self.node.get_logger().warn(f'Could not transform map to base_link: {ex}', throttle_duration_sec=1.0)

# 메인 GUI 윈도우 클래스
class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("ROS 2 관제 시스템")
        self.setGeometry(100, 100, 800, 650)
        
        self.map_label = QLabel("맵 로딩 중...")
        self.map_pixmap = None
        self.map_info = None
        self.robot_pose = (0, 0, 0) # x, y, yaw
        self.robot_pixmap = QPixmap("robot_icon.png").scaled(32, 32) # 로봇 아이콘 이미지 로드

        layout = QVBoxLayout()
        layout.addWidget(self.map_label)
        
        container = QWidget()
        container.setLayout(layout)
        self.setCentralWidget(container)

        self.setup_ros_thread()

    def setup_ros_thread(self):
        """ROS 워커를 위한 QThread 설정"""
        self.ros_thread = QThread()
        self.ros_worker = RosNodeWorker()
        self.ros_worker.moveToThread(self.ros_thread)
        
        # 스레드 시작 시 워커의 run 함수 실행 연결
        self.ros_thread.started.connect(self.ros_worker.run)
        
        # 워커의 시그널을 메인 윈도우의 슬롯에 연결
        self.ros_worker.map_updated.connect(self.update_map)
        self.ros_worker.robot_pose_updated.connect(self.update_robot_pose)
        
        # 스레드 시작
        self.ros_thread.start()

    @pyqtSlot(object)
    def update_map(self, map_msg: OccupancyGrid):
        """맵 이미지를 생성하고 표시하는 슬롯"""
        self.map_info = map_msg.info
        width = self.map_info.width
        height = self.map_info.height
        
        # OccupancyGrid 데이터를 이미지로 변환
        data = np.array(map_msg.data, dtype=np.uint8).reshape((height, width))
        image_data = np.zeros((height, width), dtype=np.uint8)
        
        # 점유(100) -> 검정(0), 비점유(0) -> 흰색(255), 알수없음(-1) -> 회색(127)
        image_data[data == 100] = 0
        image_data[data == 0] = 255
        image_data[data == -1] = 127
        
        q_image = QImage(image_data.data, width, height, width, QImage.Format_Grayscale8).rgbSwapped()
        self.map_pixmap = QPixmap.fromImage(q_image)
        self.redraw_display()

    @pyqtSlot(float, float, float)
    def update_robot_pose(self, x, y, yaw):
        """로봇 위치를 업데이트하고 다시 그리는 슬롯"""
        self.robot_pose = (x, y, yaw)
        self.redraw_display()

    def redraw_display(self):
        """맵과 로봇을 합쳐서 화면에 표시"""
        if self.map_pixmap is None:
            return
            
        # 맵을 복사하여 그 위에 로봇을 그림
        display_pixmap = self.map_pixmap.copy()
        painter = QPainter(display_pixmap)
        
        if self.map_info:
            # 월드 좌표(m)를 픽셀 좌표로 변환
            px = (self.robot_pose - self.map_info.origin.position.x) / self.map_info.resolution
            py = self.map_info.height - ((self.robot_pose - self.map_info.origin.position.y) / self.map_info.resolution)
            
            # 로봇 아이콘 회전 및 그리기
            transform = QTransform()
            transform.translate(px, py)
            transform.rotate(-math.degrees(self.robot_pose)) # yaw는 라디안이므로 도로 변환
            transform.translate(-self.robot_pixmap.width() / 2, -self.robot_pixmap.height() / 2)
            
            painter.setTransform(transform)
            painter.drawPixmap(0, 0, self.robot_pixmap)
            
        painter.end()
        self.map_label.setPixmap(display_pixmap)
        
    def closeEvent(self, event):
        """윈도우 종료 시 스레드 정리"""
        self.ros_thread.quit()
        self.ros_thread.wait()
        super().closeEvent(event)

if __name__ == '__main__':
    app = QApplication(sys.argv)
    window = MainWindow()
    window.show()
    sys.exit(app.exec_())