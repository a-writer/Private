#!/bin/bash
# command: curl -ksS --progress-bar https://raw.githubusercontent.com/a-writer/Private/master/shell/pyi.sh | bash
url_openssl="https://www.openssl.org/source/openssl-1.1.1.tar.gz"
url_py38="https://www.python.org/ftp/python/3.8.0/Python-3.8.0.tgz"
run_command() {
    echo "$@"
    "$@"
}
# run_command have bug
my_echo() {
    local message="$@"
    local length=${#message}
    local border_length=$((length + 6))
    local border=$(printf '=%.0s' $(seq 1 $border_length))
    
    echo "$border"
    echo "|| $message ||"
    echo "$border"
}
echo "-----------------------------------------------"
echo "**  Script Description:                      **"
echo "**      Compile and install OpenSSL 1.1.1    **"
echo "**      Compile and install Python 3.8.0     **"
echo "**      Switch default gcc to 9 (devtoolset) **"
echo "**  Testing Environment:                     **"
echo "**      Centos 7.6                           **"
echo "-----------------------------------------------"
if [ -f /etc/os-release ]; then
    . /etc/os-release
    if [[ "$ID" == "centos" && "$VERSION_ID" == "7" ]]; then
        echo "Running on CentOS 7"
    else
        my_echo "This script requires CentOS 7. Exiting..."
        exit 1
    fi
else
    my_echo "Could not determine OS version. Exiting..."
    exit 1
fi
echo "Wait for 5 seconds to start installation."
echo "  To terminate, please Ctrl + C."
sleep 5
my_echo "yum install base soft."
yum install -y zlib-devel bzip2-devel openssl-devel ncurses-devel sqlite-devel readline-devel tk-devel gcc make libffi-devel perl centos-release-scl
yum install -y devtoolset-9-gcc*

my_echo "enable gcc9"
source /opt/rh/devtoolset-9/enable
#切换gcc9

#gcc -v | grep 'version' || ( echo 'gcc version error' && kill -9 $$ )
gccVer="$(gcc --version | head -1 | grep -o '[0-9][\.][0-9]*' | head -1)"
if [ ! ${gccVer} ];then
    echo 'gcc cli error'
	kill -9 $$
else	
	needGCCver=9.0
	if [ `expr ${gccVer} \>= ${needGCCver}` -ne 0 ];then
		echo "gcc is >= ${needGCCver} (now:${gccVer})"
        sleep 5
	else
		echo "gcc is < ${needGCCver}"
        echo 'gcc version ${gccVer} error'
		kill -9 $$
	fi
fi

my_echo "Make tmp dir"
mkdir /opt
mkdir /opt/Python-3.8.0
mkdir /opt/openssl-1.1.1

my_echo "Clean up history file: openssl"
rm -rf /opt/openssl-1.1.1.tar.gz

my_echo "Build openssl 1.1.1"
set -e
#cd /opt && wget "${url_openssl}" --no-check-certificate && rm -rf openssl-1.1.1 && tar -zxvf openssl-1.1.1.tar.gz && cd openssl-1.1.1 && ./config --prefix=/usr/local/openssl --openssldir=/usr/local/openssl shared zlib && make -j 2 && make install
cd /opt
wget "${url_openssl}" --no-check-certificate
rm -rf openssl-1.1.1
tar -zxvf openssl-1.1.1.tar.gz
cd openssl-1.1.1
echo "./config --prefix=/usr/local/openssl --openssldir=/usr/local/openssl shared zlib"
./config --prefix=/usr/local/openssl --openssldir=/usr/local/openssl shared zlib
make -j 2
make install
set +e

echo "--Refresh PATH"
cat /etc/profile | grep /usr/local/openssl/bin || echo "export PATH=/usr/local/openssl/bin:$PATH" >> /etc/profile
cat /etc/profile | grep /usr/local/openssl/lib || echo "export LD_LIBRARY_PATH=/usr/local/openssl/lib:\$LD_LIBRARY_PATH" >> /etc/profile
cat /etc/profile | grep /usr/local/openssl/
source /etc/profile

echo "--Clean up history link: python"
unlink /usr/bin/python3
unlink /usr/bin/pip3
unlink /usr/lib64/libpython3.8.so.1.0

echo "----Clean up history file: python"
rm -rf /opt/Python-3.8.0.tgz

echo "--build python3.8.0"
set -e
#openssl version | grep '1.1.1' && cd /opt && pwd && wget ${url_py38} --no-check-certificate && rm -rf Python-3.8.0 &&tar zxf Python-3.8.0.tgz && cd Python-3.8.0 && ./configure --prefix=/usr/local/python3 --enable-shared --enable-optimizations --enable-loadable-sqlite-extensions --with-http_ssl_module --with-openssl=/usr/local/openssl && make -j 2 && make install && ln -s /usr/local/python3/bin/pip3.8 /usr/bin/pip3 && ln -s /usr/local/python3/lib/libpython3.8.so.1.0 /usr/lib64/ && ln -s /usr/local/python3/bin/python3.8 /usr/bin/python3 && python3 -m pip install -U --force-reinstall pip
openssl version | grep '1.1.1'
cd /opt
pwd
wget "${url_py38}" --no-check-certificate
rm -rf Python-3.8.0
tar zxf Python-3.8.0.tgz
cd Python-3.8.0
./configure --prefix=/usr/local/python3 --enable-shared --enable-optimizations --enable-loadable-sqlite-extensions --with-http_ssl_module --with-openssl=/usr/local/openssl
make -j 4
make install
ln -s /usr/local/python3/bin/pip3.8 /usr/bin/pip3
ln -s /usr/local/python3/lib/libpython3.8.so.1.0 /usr/lib64/
ln -s /usr/local/python3/bin/python3.8 /usr/bin/python3
python3 -m pip install -U --force-reinstall pip


echo "py3 openssl ver:"
python3 -c "import ssl; print(ssl.OPENSSL_VERSION)"
echo "openssl cli version:"
openssl version
set +e
my_echo "End of installation script"
