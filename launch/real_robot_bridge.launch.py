"""
ROS 2 로봇 관제 시스템
런치 파일: 실제 로봇 연결용 시스템
"""

from launch import LaunchDescription
from launch_ros.actions import Node
from launch.actions import DeclareLaunchArgument
from launch.substitutions import LaunchConfiguration


def generate_launch_description():
    # 런치 인수들
    map_file_arg = DeclareLaunchArgument(
        'map',
        default_value='',
        description='지도 파일 경로 (예: /home/user/turtlebot3_real_map.yaml)'
    )
    
    robot_ip_arg = DeclareLaunchArgument(
        'robot_ip',
        default_value='',
        description='로봇 IP 주소 (선택사항)'
    )

    # ROSBridge WebSocket 서버 (외부 접근 허용)
    rosbridge_server = Node(
        package='rosbridge_server',
        executable='rosbridge_websocket',
        name='rosbridge_websocket',
        parameters=[{
            'port': 9090,
            'address': '0.0.0.0',  # 외부 접근 허용
            'retry_startup_delay': 5,
            'fragment_timeout': 600,
            'delay_between_messages': 0,
            'max_message_size': None,
            'unregister_timeout': 10.0,
            'use_compression': False
        }],
        output='screen'
    )

    # TF2 Web Republisher
    tf2_web_republisher = Node(
        package='tf2_web_republisher',
        executable='tf2_web_republisher',
        name='tf2_web_republisher',
        parameters=[{
            'angular_thres': 0.01,
            'trans_thres': 0.01,
            'rate': 10.0
        }],
        output='screen'
    )

    # 로봇 상태 모니터링 노드
    robot_monitor = Node(
        package='robot_state_publisher',
        executable='robot_state_publisher',
        name='robot_state_publisher',
        output='screen'
    )

    return LaunchDescription([
        map_file_arg,
        robot_ip_arg,
        rosbridge_server,
        tf2_web_republisher,
        robot_monitor
    ])