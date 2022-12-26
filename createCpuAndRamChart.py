from os import listdir
from os.path import isfile, join
import matplotlib.pyplot as plt


def parseData(f):
    lines = f.readlines()

    timeIndexes = list(range(1, len(lines)+1))

    cpu = []
    ram = []

    for index in range(0, len(lines)):
        l = lines[index].rstrip('\n').split()
        print(l)
        cpu.append(float(l[7]))
        ram.append(int(l[12]) / 1024)

    return timeIndexes, cpu, ram


def createChart(timeIndexes, cpu, ram, filename):
    fig, ax = plt.subplots()
    fig.subplots_adjust(right=0.75)

    twin1 = ax.twinx()

    p1, = ax.plot(timeIndexes, cpu, "b-", label="cpu")
    p2, = twin1.plot(timeIndexes, ram, "r-", label="ram")

    ax.set_xlabel('Time, c')
    ax.set_ylabel("CPU usage, %")
    twin1.set_ylabel("Ram usage, mb")
    ax.legend(handles=[p1, p2])
    # plt.show()
    plt.savefig(filename)
    plt.clf()


def main():
    path = './logs'
    files = [f for f in listdir(path) if isfile(join(path, f))]
    for fName in files:
        f = open(join(path, fName), 'r')
        time, cpu, ram = parseData(f)
        f.close()
        print(path)
        createChart(time, cpu, ram, join(path, fName.split('.')[0] + '.png'))


if __name__ == '__main__':
    main()
