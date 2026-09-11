# Image-library source and replacement

The bundled sharp native addon (0.35.3) dynamically loads the libvips DLLs in its lib directory. These DLLs may be replaced with compatible rebuilt versions. This distribution adds no restriction on modification or reverse engineering for debugging modifications to these libraries.

- sharp source: https://github.com/lovell/sharp/tree/v0.35.3
- libvips 8.18.3 source: https://github.com/libvips/libvips/tree/v8.18.3
- libvips source archive: https://github.com/libvips/libvips/archive/refs/tags/v8.18.3.tar.gz
- Dependency build recipes and source URLs: https://github.com/lovell/sharp-libvips/tree/v1.3.0
- Exact bundled dependency versions: dsh/node_modules/@img/sharp-win32-x64/versions.json (including libtiff revision 732665c; the release build recipe lists an earlier libtiff revision).

See LIBVIPS-COPYING.txt and LIBVIPS-THIRD-PARTY-NOTICES.md. The complete upstream licenses remain applicable, including the terms for LGPL components. Source is hosted by the upstream projects at the locations above; this package does not claim a reproducible rebuild of those binaries.
