"""
ROS 2 워커 클래스
ROS 노드를 별도 스레드에서 실행하고 GUI와 통신
"""

import rclpy
from rclpy.node import Node
from rclpy.qos import QoSProfile, ReliabilityPolicy, DurabilityPolicy
from PyQt5.QtCore import QObject, pyqtSignal
from nav_msgs.msg import OccupancyGrid, Odometry
from sensor_msgs.msg import LaserScan
from tf2_ros import TransformException
from tf2_ros.buffer import Buffer
from tf2_ros.transform_listener import TransformListener
from geometry_msgs.msg import PoseStamped
import math


class RosNodeWorker(QObject):
    """ROS 노드를 실행하는 워커 클래스"""
    
    # PyQt 시그널 정의
    map_updated = pyqtSignal(object)
    robot_pose_updated = pyqtSignal(float, float, float)
    laser_scan_updated = pyqtSignal(object)
    odometry_updated = pyqtSignal(object)
    connection_status_changed = pyqtSignal(str)
    error_occurred = pyqtSignal(str)

    def __init__(self):
        super().__init__()
        self.node = None
        self.tf_buffer = None
        self.tf_listener = None
        self._running = False

    def run(self):
        """ROS 노드를 초기화하고 스핀을 시작하는 메인 함수"""
        try:
            rclpy.init()
            self.node = Node('robot_control_gui_node')
            self._running = True
            
            # 연결 상태 시그널 발생
            self.connection_status_changed.emit("ROS 2 노드 초기화 중...")
            
            # TF 리스너 초기화
            self.tf_buffer = Buffer()
            self.tf_listener = TransformListener(self.tf_buffer, self.node)

            # QoS 프로파일 설정
            map_qos = QoSProfile(
                depth=1,
                reliability=ReliabilityPolicy.RELIABLE,
                durability=DurabilityPolicy.TRANSIENT_LOCAL
            )
            
            sensor_qos = QoSProfile(
                depth=10,
                reliability=ReliabilityPolicy.BEST_EFFORT
            )

            # 구독자들 생성
            self.node.create_subscription(
                OccupancyGrid,
                '/map',
                self.map_callback,
                map_qos
            )
            
            self.node.create_subscription(
                LaserScan,
                '/scan',
                self.laser_scan_callback,
                sensor_qos
            )
            
            self.node.create_subscription(
                Odometry,
                '/odom',
                self.odometry_callback,
                sensor_qos
            )
            
            # 목표 지점 발행자 생성
            self.goal_publisher = self.node.create_publisher(
                PoseStamped,
                '/goal_pose',
                10
            )
            
            # TF 조회를 위한 타이머 설정
            self.node.create_timer(0.1, self.tf_lookup_timer)

            self.node.get_logger().info("로봇 제어 GUI 노드가 시작되었습니다.")
            self.connection_status_changed.emit("연결됨")
            
            # ROS 스핀 루프
            rclpy.spin(self.node)
            
        except Exception as e:
            self.error_occurred.emit(f"ROS 노드 오류: {str(e)}")
            self.connection_status_changed.emit("연결 실패")
        finally:
            self.cleanup()

    def cleanup(self):
        """리소스 정리"""
        if self.node:
            self.node.destroy_node()
        if rclpy.ok():
            rclpy.shutdown()
        self._running = False

    def map_callback(self, msg: OccupancyGrid):
        """맵 데이터를 받으면 시그널을 발생시키는 콜백"""
        if self._running:
            self.map_updated.emit(msg)

    def laser_scan_callback(self, msg: LaserScan):
        """라이다 스캔 데이터 콜백"""
        if self._running:
            self.laser_scan_updated.emit(msg)

    def odometry_callback(self, msg: Odometry):
        """오도메트리 데이터 콜백"""
        if self._running:
            self.odometry_updated.emit(msg)

    def tf_lookup_timer(self):
        """주기적으로 map -> base_link 변환을 조회하고 시그널 발생"""
        if not self._running:
            return
            
        try:
            trans = self.tf_buffer.lookup_transform(
                'map', 'base_link', rclpy.time.Time()
            )
            t = trans.transform.translation
            q = trans.transform.rotation
            
            # 쿼터니언을 오일러 각(yaw)으로 변환
            yaw = math.atan2(
                2.0 * (q.w * q.z + q.x * q.y),
                1.0 - 2.0 * (q.y * q.y + q.z * q.z)
            )
            
            self.robot_pose_updated.emit(t.x, t.y, yaw)
            
        except TransformException as ex:
            # 로그 스로틀링을 위해 1초마다만 경고 출력
            if self.node:
                self.node.get_logger().warn(
                    f'map -> base_link 변환을 가져올 수 없습니다: {ex}',
                    throttle_duration_sec=1.0
                )

    def publish_goal(self, x: float, y: float, yaw: float):
        """목표 지점을 발행하는 메서드"""
        if not self._running or not self.goal_publisher:
            return
            
        goal_msg = PoseStamped()
        goal_msg.header.stamp = self.node.get_clock().now().to_msg()
        goal_msg.header.frame_id = 'map'
        
        goal_msg.pose.position.x = x
        goal_msg.pose.position.y = y
        goal_msg.pose.position.z = 0.0
        
        # yaw를 쿼터니언으로 변환
        goal_msg.pose.orientation.x = 0.0
        goal_msg.pose.orientation.y = 0.0
        goal_msg.pose.orientation.z = math.sin(yaw / 2.0)
        goal_msg.pose.orientation.w = math.cos(yaw / 2.0)
        
        self.goal_publisher.publish(goal_msg)
        
        if self.node:
            self.node.get_logger().info(
                f'목표 지점 발행: x={x:.2f}, y={y:.2f}, yaw={yaw:.2f}'
            )

    def stop(self):
        """워커 중지"""
        self._running = False