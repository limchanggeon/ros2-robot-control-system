"""
ROS 2 로봇 관제 시스템
런치 파일: 웹 브릿지 시스템
"""

from launch import LaunchDescription
from launch_ros.actions import Node
from launch.actions import DeclareLaunchArgument
from launch.substitutions import LaunchConfiguration


def generate_launch_description():
    # 런치 인수 선언
    port_arg = DeclareLaunchArgument(
        'port',
        default_value='9090',
        description='ROSBridge WebSocket 포트'
    )
    
    address_arg = DeclareLaunchArgument(
        'address',
        default_value='0.0.0.0',
        description='ROSBridge WebSocket 주소'
    )

    # ROSBridge WebSocket 서버
    rosbridge_server = Node(
        package='rosbridge_server',
        executable='rosbridge_websocket',
        name='rosbridge_websocket',
        parameters=[{
            'port': LaunchConfiguration('port'),
            'address': LaunchConfiguration('address'),
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
        output='screen'
    )

    return LaunchDescription([
        port_arg,
        address_arg,
        rosbridge_server,
        tf2_web_republisher
    ])