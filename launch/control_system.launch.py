"""
ROS 2 로봇 관제 시스템
런치 파일: 전체 관제 시스템
"""

from launch import LaunchDescription
from launch_ros.actions import Node
from launch.actions import DeclareLaunchArgument, IncludeLaunchDescription
from launch.substitutions import LaunchConfiguration, PathJoinSubstitution
from launch_ros.substitutions import FindPackageShare


def generate_launch_description():
    # 런치 인수들
    turtlebot3_model_arg = DeclareLaunchArgument(
        'model',
        default_value='burger',
        description='TurtleBot3 모델 (burger, waffle, waffle_pi)'
    )
    
    slam_arg = DeclareLaunchArgument(
        'slam',
        default_value='True',
        description='SLAM 사용 여부'
    )
    
    map_file_arg = DeclareLaunchArgument(
        'map',
        default_value='',
        description='사전 생성된 지도 파일 경로 (SLAM=False인 경우)'
    )

    # TurtleBot3 Bringup
    turtlebot3_bringup = IncludeLaunchDescription(
        PathJoinSubstitution([
            FindPackageShare('turtlebot3_bringup'),
            'launch',
            'robot.launch.py'
        ]),
        launch_arguments={
            'use_sim_time': 'false'
        }.items()
    )

    # SLAM 또는 지도 서버
    navigation_launch = IncludeLaunchDescription(
        PathJoinSubstitution([
            FindPackageShare('nav2_bringup'),
            'launch',
            'bringup_launch.py'
        ]),
        launch_arguments={
            'slam': LaunchConfiguration('slam'),
            'map': LaunchConfiguration('map'),
            'use_sim_time': 'false',
            'params_file': PathJoinSubstitution([
                FindPackageShare('turtlebot3_navigation2'),
                'param',
                'burger.yaml'
            ])
        }.items()
    )

    # 웹 브릿지 시스템
    web_bridge_launch = IncludeLaunchDescription(
        PathJoinSubstitution([
            FindPackageShare('ros_system'),  # 패키지명은 실제 패키지명으로 변경 필요
            'launch',
            'web_bridge.launch.py'
        ])
    )

    return LaunchDescription([
        turtlebot3_model_arg,
        slam_arg,
        map_file_arg,
        turtlebot3_bringup,
        navigation_launch,
        web_bridge_launch
    ])