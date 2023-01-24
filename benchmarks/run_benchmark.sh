echo "Building benchmarks"
npm run build:benchmarks || exit 1
# Set cpu for benchmark

echo "Disabling turboboost | 1"
echo 1 | sudo tee /sys/devices/system/cpu/intel_pstate/no_turbo > /dev/null
cat /sys/devices/system/cpu/intel_pstate/no_turbo

echo "Enabling performance mode"
for i in /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor
do
    echo performance | sudo tee $i > /dev/null
    # cat $i
done
cat /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor

echo "Disabling hyperthreading (core 1) | 0"
echo 0 | sudo tee /sys/devices/system/cpu/cpu1/online > /dev/null
cat /sys/devices/system/cpu/cpu1/online

echo "Running benchmark on core 0"
# Run node on cpu 0
sudo perf stat -- taskset -c 0 node "$1"

# Revert changes

echo "Enabling turboboost | 0"
echo 0 | sudo tee /sys/devices/system/cpu/intel_pstate/no_turbo > /dev/null
cat /sys/devices/system/cpu/intel_pstate/no_turbo

echo "Enabling hyperthreading (core 1) | 1"
echo 1 | sudo tee /sys/devices/system/cpu/cpu1/online > /dev/null
cat /sys/devices/system/cpu/cpu1/online

echo "Enabling powersave mode"
for i in /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor
do
  echo powersave | sudo tee $i > /dev/null
done
cat /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor
