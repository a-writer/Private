#!/bin/bash
#  原始命令：hostnamectl set-hostname $(echo -n "$(ifconfig eth0 | grep 'inet ' | awk '{print $2}')" | python3 -c 'import sys;import zlib;print("%08x"%(zlib.crc32(sys.stdin.read())%(1<<32)))')
#  当前脚本为chatgpt.com扩展
# 检查Python版本是否为Python 3
python_version=$(python3 --version 2>&1)
if [[ "$python_version" != "Python 3."* ]]; then
    echo "错误：未找到Python 3。当前版本为：$python_version"
    exit 1
fi

echo "Python 版本校验通过：$python_version"

# 获取eth0接口的IP地址
ip_address=$(ifconfig eth0 | grep 'inet ' | awk '{print $2}')

# 如果没有找到IP地址，提示错误并退出
if [ -z "$ip_address" ]; then
    echo "未找到eth0接口的IP地址，请检查网络配置。"
    exit 1
fi

echo "获取到的eth0接口IP地址为：$ip_address"

# 计算CRC32值
crc32_value=$(echo -n "$ip_address" | python3 -c 'import sys; import zlib; input=sys.stdin.read().encode(); crc32=zlib.crc32(input) & 0xffffffff; print("%08x" % crc32)')

# 校验CRC32值是否为8位16进制数
if [[ ! "$crc32_value" =~ ^[0-9a-fA-F]{8}$ ]]; then
    echo "错误：CRC32值计算错误。计算结果为：$crc32_value"
    exit 1
fi

echo "根据IP地址计算得到的CRC32值为：$crc32_value"

# 设置主机名
hostnamectl set-hostname "$crc32_value"

echo "主机名已设置为：$crc32_value"
